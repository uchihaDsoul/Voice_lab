# Voice_lab 🎙️

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

Voice_lab is a full-stack, modern web application designed for audio processing, voice recording, and real-time speech interactions. Built with a lightning-fast Vite frontend and a robust Node.js backend, this project serves as a sandbox for exploring voice technologies.

---

## ✨ Core Features

Here is a breakdown of the key features and capabilities of this project:

### 🎤 Audio Handling & Processing
* **Real-Time Audio Capture:** Capture high-quality voice input directly from the user's browser using the Web Audio API.
* **Audio Playback & Review:** Users can instantly listen back to their recorded audio before submitting or processing it.
* **Format Conversion:** Backend support for handling and converting audio buffers into standardized formats for API consumption or storage.

### 💻 Modern Frontend (Vite + TypeScript)
* **Lightning-Fast Builds:** Utilizes Vite for instant server start and Hot Module Replacement (HMR).
* **Strict Type Safety:** Fully written in TypeScript to ensure robust, bug-free UI components and state management.
* **Responsive UI:** A clean interface that adapts to different screen sizes, providing instant visual feedback on recording status and processing states.

### ⚙️ Robust Backend Architecture (Node.js)
* **Custom Server Integration:** A dedicated `server.ts` handles custom API routing, secure data processing, and bridging the gap between the frontend and external services.
* **Secure Environment Management:** Pre-configured with `.env.example` to ensure API keys and environment-specific variables are handled securely and never hardcoded.
* **Streamlined Build Process:** Unified package management to handle both client-side UI dependencies and server-side logic in one cohesive repository.

---

## 🛠️ Tech Stack

**Frontend:**
* **Vite** - Next-generation frontend build tool
* **TypeScript** - Strongly typed programming language
* **HTML5 / CSS3** - Core web structure and styling
* **Web Audio API** - For browser-based audio interactions

**Backend:**
* **Node.js** - JavaScript runtime environment
* **TypeScript (ts-node)** - Running strictly typed backend logic via `server.ts`
* **dotenv** - For managing environment variables securely

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v16 or higher recommended) and `npm` installed on your machine.

### Local Installation

1. **Install all dependencies:**
   ```bash
   npm install