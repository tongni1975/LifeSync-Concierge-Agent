<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1xPUt1iTWOaA-wxVV6zwQVuyha-FW0YNw

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`




# LifeSync Concierge - Project Writeup

## The Pitch

### Core Concept & Value
LifeSync Concierge is a browser-based "Operating System" for personal health. It moves beyond simple tracking by using an **Orchestrator Agent** to synthesize disparate data points—diet, heart rate, and mood—into actionable, holistic advice. Its core value lies in **Contextual Intelligence**: it doesn't just log data; it understands how your lunch impacts your workout and how your stress levels should dictate your recovery.

### Problem Statement
Health data is fragmented. We track calories in one app, workouts in another, and mental health nowhere. Users are drowning in raw data but starving for insight. A heart rate monitor can tell you your pulse is 120bpm, but it can't tell you that *because* you didn't sleep well and are stressed, you should skip the HIIT class today.

### The Solution
A local-first web app powered by a **Multi-Agent Gemini System**. By deploying specialized agents (Nutritionist, Trainer, Wellness Coach) that share a common memory bank, LifeSync offers the guidance of a full medical team. It runs offline-capable logic where possible and uses the Gemini API for complex reasoning, ensuring a fast, privacy-conscious experience.

## The Implementation

### Technical Architecture
```
[User] <-> [React Frontend (UI/UX)]
              |
        (Input Stream)
              |
      [AgentService (Logic Layer)]
              |
              +---> 1. CONTEXT COMPACTION (Summarizes LocalStorage Logs)
              |
              +---> 2. ORCHESTRATOR AGENT (Gemini 2.5 Flash)
                        | "Classifies Intent"
                        |
            +-----------+-----------+
            |           |           |
      [Nutritionist] [Trainer] [Wellness Coach]
            |           |           |
      (JSON Parser)  (Vitals)  (Google Search Tool)
            |           |           |
            +-----------+-----------+
                        |
              [Synthesized Response]
```

### Three Key Concepts Applied

**1. Multi-Agent System**
Implemented a Manager-Worker pattern. The `processRequest` function acts as the Orchestrator, dynamically routing user intent to specialized personas. This prevents "prompt drift" and ensures high-quality, domain-specific advice.

**2. Tools (Google Search)**
The Wellness Agent utilizes the **Google Search Tool** (`googleSearch: {}`) to break the "knowledge cutoff" barrier. It autonomously fetches real-time YouTube video links and motivational quotes, grounding its advice in actual, clickable resources.

**3. Sessions & Memory**
We use **Context Compaction** to handle long-term memory. The app stores granular logs in LocalStorage. Before every API call, it aggregates the last 5 days of history into a dense statistical summary, injecting this "Short-Term Context" into the agent's prompt for continuity.

## In Summary

### Agents
Agents are the only technology capable of bridging the gap between raw data and human meaning. A standard algorithm can plot a graph; an agent can tell you *why* the graph looks that way and what to do about it.

### The Build
Built with **React 19**, **TypeScript**, and **Tailwind CSS**. The intelligence layer leverages **Google's GenAI SDK** (Gemini 2.5 Flash) for sub-second latency. Data persistence is handled via browser LocalStorage for privacy.

### Demo Walkthrough
*   User defines goals (e.g., "Lose weight") in *Settings*.
*   User logs "Avocado Toast" in *Tracker*; Nutrition Agent calculates calories instantly.
*   *Dashboard* updates visualizations for Calorie vs. Goal progress.
*   User asks *Concierge* for help; Orchestrator routes query to Trainer Agent for a workout plan.
*   *Wellness Feed* fetches a relevant YouTube video using the Search Tool.