var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_fs = __toESM(require("fs"), 1);
var import_url = require("url");
var import_multer = __toESM(require("multer"), 1);
var import_genai = require("@google/genai");
var import_meta = {};
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path.default.dirname(__filename);
var ai = new import_genai.GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
var upload = (0, import_multer.default)({
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 }
  // 50MB limit
});
if (!import_fs.default.existsSync("uploads")) {
  import_fs.default.mkdirSync("uploads");
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  app.post("/api/analyze", upload.single("audio"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const { path: filePath, originalname, size } = req.file;
    try {
      const fileBuffer = import_fs.default.readFileSync(filePath);
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
      if (import_fs.default.existsSync(filePath)) {
        import_fs.default.unlinkSync(filePath);
      }
    }
  });
  app.post("/api/settings", (req, res) => {
    res.json({ status: "success", settings: req.body });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
//# sourceMappingURL=server.cjs.map
