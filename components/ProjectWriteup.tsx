import React, { useState } from 'react';
import { agentService } from '../services/geminiService';

const ProjectWriteup: React.FC = () => {
  const [generatingImg, setGeneratingImg] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const handleDownload = () => {
    const content = `# LifeSync Concierge - Project Writeup

## Category 1: The Pitch

### Core Concept & Value
LifeSync Concierge is a browser-based "Operating System" for personal health. It moves beyond simple tracking by using an **Orchestrator Agent** to synthesize disparate data points—diet, heart rate, and mood—into actionable, holistic advice. Its core value lies in **Contextual Intelligence**: it doesn't just log data; it understands how your lunch impacts your workout and how your stress levels should dictate your recovery.

### Problem Statement
Health data is fragmented. We track calories in one app, workouts in another, and mental health nowhere. Users are drowning in raw data but starving for insight. A heart rate monitor can tell you your pulse is 120bpm, but it can't tell you that *because* you didn't sleep well and are stressed, you should skip the HIIT class today.

### The Solution
A local-first web app powered by a **Multi-Agent Gemini System**. By deploying specialized agents (Nutritionist, Trainer, Wellness Coach) that share a common memory bank, LifeSync offers the guidance of a full medical team. It runs offline-capable logic where possible and uses the Gemini API for complex reasoning, ensuring a fast, privacy-conscious experience.

## Category 2: The Implementation

### Technical Architecture
\`\`\`
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
\`\`\`

### Three Key Concepts Applied

**1. Multi-Agent System**
Implemented a Manager-Worker pattern. The \`processRequest\` function acts as the Orchestrator, dynamically routing user intent to specialized personas. This prevents "prompt drift" and ensures high-quality, domain-specific advice.

**2. Tools (Google Search)**
The Wellness Agent utilizes the **Google Search Tool** (\`googleSearch: {}\`) to break the "knowledge cutoff" barrier. It autonomously fetches real-time YouTube video links and motivational quotes, grounding its advice in actual, clickable resources.

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
    `;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'LifeSync_Project_Writeup.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateThumbnail = async () => {
    setGeneratingImg(true);
    const url = await agentService.generateThumbnail();
    if (url) {
        setThumbnailUrl(url);
    } else {
        alert("Failed to generate image. Please try again.");
    }
    setGeneratingImg(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24 animate-fade-in text-slate-800">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-violet-800 p-12 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">LifeSync Concierge</h1>
                <p className="text-xl opacity-90 font-light max-w-2xl leading-relaxed mb-6">
                    Your privacy-first, multi-agent health ecosystem.
                </p>
            </div>
            <button 
              onClick={handleDownload}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-xl text-sm font-medium transition-colors flex items-center backdrop-blur-sm shadow-lg whitespace-nowrap"
            >
              <span className="mr-2">📥</span> Download .md
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-16 -mt-16"></div>
      </div>

      {/* AI Thumbnail Generator */}
      <section className="bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-800 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                    <span className="bg-purple-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Gemini Powered</span>
                    <h3 className="text-2xl font-bold">Submission Thumbnail</h3>
                </div>
                <p className="text-slate-400 mb-6">
                    Generate a high-quality, unique 3D illustration for your project submission using the <code>gemini-2.5-flash-image</code> model.
                </p>
                <button
                    onClick={generateThumbnail}
                    disabled={generatingImg}
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                    {generatingImg ? (
                        <>
                           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           Generating Art...
                        </>
                    ) : '✨ Generate Thumbnail'}
                </button>
            </div>
            
            <div className="w-full md:w-1/2 aspect-video bg-slate-800 rounded-xl border-2 border-slate-700 border-dashed flex items-center justify-center overflow-hidden relative">
                {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt="Generated App Thumbnail" className="w-full h-full object-cover" />
                ) : (
                    <div className="text-center text-slate-500 p-4">
                        <p className="text-4xl mb-2">🖼️</p>
                        <p className="text-sm">Image will appear here</p>
                    </div>
                )}
            </div>
        </div>
      </section>

      {/* Category 1: The Pitch */}
      <section className="space-y-8">
        <div className="flex items-center space-x-4 border-b border-slate-200 pb-4">
           <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">Category 1</span>
           <h2 className="text-3xl font-bold text-slate-900">The Pitch</h2>
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-8">
          <div>
            <h3 className="text-xl font-bold text-indigo-900 mb-3">Core Concept & Value</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              LifeSync Concierge is a browser-based "Operating System" for personal health. It moves beyond simple tracking by using an <strong>Orchestrator Agent</strong> to synthesize disparate data points—diet, heart rate, and mood—into actionable, holistic advice. Its core value lies in <strong>Contextual Intelligence</strong>: it doesn't just log data; it understands how your lunch impacts your workout and how your stress levels should dictate your recovery.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-2 flex items-center">
                <span className="text-xl mr-2">🚨</span> Problem Statement
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Health data is fragmented. We track calories in one app, workouts in another, and mental health nowhere. Users are drowning in raw data but starving for insight. A heart rate monitor can tell you your pulse is 120bpm, but it can't tell you that <em>because</em> you didn't sleep well and are stressed, you should skip the HIIT class today.
              </p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-800 mb-2 flex items-center">
                <span className="text-xl mr-2">💡</span> The Solution
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                A local-first web app powered by a <strong>Multi-Agent Gemini System</strong>. By deploying specialized agents (Nutritionist, Trainer, Wellness Coach) that share a common memory bank, LifeSync offers the guidance of a full medical team. It runs offline-capable logic where possible and uses the Gemini API for complex reasoning, ensuring a fast, privacy-conscious experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Category 2: The Implementation */}
      <section className="space-y-8">
        <div className="flex items-center space-x-4 border-b border-slate-200 pb-4">
           <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">Category 2</span>
           <h2 className="text-3xl font-bold text-slate-900">The Implementation</h2>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Technical Architecture</h3>
          <div className="bg-slate-900 text-slate-300 p-6 rounded-xl font-mono text-sm overflow-x-auto mb-8 shadow-inner">
<pre>{`[User] <-> [React Frontend (UI/UX)]
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
              [Synthesized Response]`}</pre>
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-6">Three Key Concepts Applied</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-indigo-100 bg-indigo-50/50 p-5 rounded-xl">
              <div className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-lg flex items-center justify-center font-bold mb-3">1</div>
              <h4 className="font-bold text-indigo-900 mb-2">Multi-Agent System</h4>
              <p className="text-sm text-slate-600">
                Implemented a <strong>Manager-Worker pattern</strong>. The `processRequest` function acts as the Orchestrator, dynamically routing user intent to specialized personas. This prevents "prompt drift" and ensures high-quality, domain-specific advice.
              </p>
            </div>
            <div className="border border-indigo-100 bg-indigo-50/50 p-5 rounded-xl">
              <div className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-lg flex items-center justify-center font-bold mb-3">2</div>
              <h4 className="font-bold text-indigo-900 mb-2">Tools (Google Search)</h4>
              <p className="text-sm text-slate-600">
                The Wellness Agent utilizes the <strong>Google Search Tool</strong> (`googleSearch: {}`) to break the "knowledge cutoff" barrier. It autonomously fetches real-time YouTube video links and motivational quotes, grounding its advice in actual, clickable resources.
              </p>
            </div>
            <div className="border border-indigo-100 bg-indigo-50/50 p-5 rounded-xl">
              <div className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-lg flex items-center justify-center font-bold mb-3">3</div>
              <h4 className="font-bold text-indigo-900 mb-2">Sessions & Memory</h4>
              <p className="text-sm text-slate-600">
                We use <strong>Context Compaction</strong> to handle long-term memory. The app stores granular logs in LocalStorage. Before every API call, it aggregates the last 5 days of history into a dense statistical summary, injecting this "Short-Term Context" into the agent's prompt for continuity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* In Summary / Conclusion */}
      <section className="bg-slate-50 border border-slate-200 p-8 rounded-2xl">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Project Summary</h3>
        <div className="space-y-4 text-slate-600 text-sm">
           <p>
             <strong>Agents:</strong> Agents are the only technology capable of bridging the gap between raw data and human meaning. A standard algorithm can plot a graph; an agent can tell you <em>why</em> the graph looks that way and what to do about it.
           </p>
           <p>
             <strong>The Build:</strong> Built with <strong>React 19</strong>, <strong>TypeScript</strong>, and <strong>Tailwind CSS</strong>. The intelligence layer leverages <strong>Google's GenAI SDK</strong> (Gemini 2.5 Flash) for sub-second latency. Data persistence is handled via browser LocalStorage for privacy.
           </p>
           <p>
             <strong>Demo Walkthrough:</strong>
             <ul className="list-disc pl-5 mt-2 space-y-1">
               <li>User defines goals (e.g., "Lose weight") in <em>Settings</em>.</li>
               <li>User logs "Avocado Toast" in <em>Tracker</em>; Nutrition Agent calculates calories instantly.</li>
               <li><em>Dashboard</em> updates visualizations for Calorie vs. Goal progress.</li>
               <li>User asks <em>Concierge</em> for help; Orchestrator routes query to Trainer Agent for a workout plan.</li>
               <li><em>Wellness Feed</em> fetches a relevant YouTube video using the Search Tool.</li>
             </ul>
           </p>
        </div>
      </section>

    </div>
  );
};

export default ProjectWriteup;