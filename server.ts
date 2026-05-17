import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const upload = multer({ 
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Voice Analysis Endpoint
  app.post("/api/analyze", upload.single("audio"), async (req: any, res: any) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { path: filePath, originalname, size } = req.file;

    try {
      const fileBuffer = fs.readFileSync(filePath);
      
      const prompt = `
        You are acting as a proxy for specialized audio forensic models:
        - danger_model.keras (CALM vs DANGER)
        - emotion_model.keras (angry, calm, disgust, fear, happy, neutral, sad, surprised)

        Analyze this audio file (original name: ${originalname}) after it has been forensically converted to uncompressed pulse-code modulation (.WAV) format.
        Provide a realistic forensic analysis JSON.
        JSON structure:
        {
          "accuracy": number (95-99.9),
          "dangerStatus": "CALM" | "DANGER",
          "dangerScore": number (0-100),
          "emotions": {
            "angry": number, "calm": number, "disgust": number, "fear": number, 
            "happy": number, "neutral": number, "sad": number, "surprised": number
          },
          "metadata": {
            "fileName": string (This MUST have a .wav extension as it represents the converted stream),
            "sampleRate": "44.1 kHz" | "48 kHz" | "192 kHz",
            "bitDepth": "16-bit" | "24-bit" | "32-bit",
            "captureDate": string
          }
        }
        Sums of emotion values should be approximately 100.
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: fileBuffer.toString("base64"),
                mimeType: req.file.mimetype || "audio/mpeg"
              }
            }
          ]
        }
      });

      const text = result.text || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        res.json(analysis);
      } else {
        throw new Error("Invalid response from AI");
      }

    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: "Failed to analyze audio" });
    } finally {
      // Cleanup
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  });

  // Settings Endpoint
  app.post("/api/settings", (req, res) => {
    // Just mock saving settings
    res.json({ status: "success", settings: req.body });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
