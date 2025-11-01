# Quick AI Setup Guide

## Step 1: Install OpenAI Package

Run this command in your terminal:

```bash
npm install openai
```

or if using yarn:

```bash
yarn add openai
```

## Step 2: Add API Key

Add this line to your `.env.local` file:

```env
OPENAI_API_KEY=your-api-key-here
```

**Get your API key:**
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Go to API Keys section
4. Create new secret key
5. Copy and paste it in `.env.local`

## Step 3: Restart Development Server

```bash
npm run dev
```

## Step 4: Test AI Features

Visit: http://localhost:3000/ai-assistant

---

## ✅ That's it! Your AI features are now ready to use!

For detailed documentation, see `AI_FEATURES.md`
