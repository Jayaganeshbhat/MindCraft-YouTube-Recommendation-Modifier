# MindCraft

Your AI-guided learning assistant.

## Prerequisites

Before running the project, make sure you have the following installed:

- Node.js: v22.14.0
- Yarn: v1.22.22 (install globally via npm)

```bash
npm install -g yarn
```
---

## Installation

Install all project dependencies:

```bash
yarn install
```
---

## Environment Setup

### 1. Create a `.env` File

Copy the example file to start with:

```bash
cp .env.example .env
```
Then fill in your actual credentials.

### 2. `.env.example`
```
# Server
PORT=3000
SESSION_SECRET=my-session-secretq233121

# MongoDB
MONGO_URI=mongodb://localhost:27017/mindcraft

# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Gemini
GEMINI_API_KEY=<your-gemini-key>
```

### 3. Get Your API Keys
* Google OAuth credentials → [Google Cloud Console](https://console.cloud.google.com/auth/clients)
  - In Authorized JavaScript origins, give https://localhost.
  - In Authorized redirect URIs, give https://localhost/api/auth/google/callback. 
  - Create OAuth 2.0 credentials and copy your Client ID and Client Secret.

* Gemini API Key → [Google AI Studio](https://aistudio.google.com/api-keys)
  - Generate a new key and paste it into the `.env` file.

---

## Run the App

Start the Vite development server:

```bash
yarn dev
```

---

## Notes

* Ensure no other process is using port 5173.
* Stop the dev server with Ctrl + C.