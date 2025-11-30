import React from 'react';

const ProjectWriteup: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-3xl text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">LifeSync Concierge Agent</h1>
        <p className="opacity-90">Google GenAI Hackathon Submission</p>
      </div>

      {/* Category 1: The Pitch */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-3 mb-6">
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Category 1</span>
          <h2 className="text-2xl font-bold text-slate-800">The Pitch (Problem, Solution, Value)</h2>
        </div>
        
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <div>
            <h3 className="font-semibold text-slate-800 text-lg mb-2">Problem Statement</h3>
            <p>
              In the modern age, personal health data is fragmented. We track steps in one app, food in another, and consume mental wellness content on yet another platform. 
              Users struggle to synthesize this data into actionable insights. They have the <em>numbers</em>, but lack the <em>guidance</em> of a cohesive team of experts (Nutritionist, Trainer, Psychologist) to interpret that data daily.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 text-lg mb-2">Agents: Why Agents?</h3>
            <p>
              Standard algorithms can create charts, but they cannot <em>reason</em>. Agents uniquely solve this by adopting specific personas to analyze the same dataset differently. 
              A <strong>Nutrition Agent</strong> sees a calorie deficit and suggests a snack, while a <strong>Training Agent</strong> sees the same deficit and adjusts workout intensity. 
              An LLM-powered multi-agent system provides the qualitative synthesis that raw data lacks.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 text-lg mb-2">Core Concept & Value</h3>
            <p>
              <strong>LifeSync Concierge</strong> is an offline-first web application acting as a holistic health partner. 
              It uses a localized Memory Bank (local storage) and a Multi-Agent Orchestrator to route user queries to the best expert.
              The value lies in <strong>Contextual Continuity</strong>: The agent knows your history, your mood, and your goals, offering personalized YouTube video recommendations (via Search Grounding) and motivation exactly when you need it.
            </p>
          </div>
        </div>
      </section>

      {/* Category 2: Implementation */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-3 mb-6">
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Category 2</span>
          <h2 className="text-2xl font-bold text-slate-800">The Implementation</h2>
        </div>

        <div className="space-y-6 text-slate-600 leading-relaxed">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2">Architecture</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li><strong>Frontend:</strong> React 18 + TypeScript + Tailwind.</li>
                    <li><strong>AI Model:</strong> Gemini 2.5 Flash (via Google GenAI SDK).</li>
                    <li><strong>State/Memory:</strong> LocalStorage for persistence ("Offline" capability).</li>
                    <li><strong>Orchestrator:</strong> A classifier agent that routes queries.</li>
                </ul>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2">Key Concepts Applied</h4>
                <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li><strong>Multi-Agent System:</strong> Implementation of specialized personas (Nutritionist, Trainer, Coach) managed by a Router.</li>
                    <li><strong>Tools (Search):</strong> Using <code>googleSearch</code> tool for the Wellness Agent to find real-world video content.</li>
                    <li><strong>Sessions & Memory:</strong> Context compaction of the last 5 days of health logs injected into the prompt system instructions.</li>
                </ol>
            </div>
          </div>

          <div>
             <h3 className="font-semibold text-slate-800 text-lg mb-2">The Build Process</h3>
             <p>
                 I built this using a React functional component structure. The core logic resides in <code>services/geminiService.ts</code>.
                 This service acts as the brain. When a request comes in:
             </p>
             <ol className="list-decimal pl-5 mt-4 space-y-2">
                 <li>The app retrieves the User Profile and last 5 days of logs from Local Storage (Long-term Memory simulation).</li>
                 <li>The <strong>Orchestrator Agent</strong> analyzes the query intent.</li>
                 <li>The query is routed to a sub-agent (e.g., WellnessCoach).</li>
                 <li>If it's the WellnessCoach, it utilizes the <strong>Google Search Tool</strong> to fetch relevant YouTube videos for the user's current mood.</li>
             </ol>
          </div>

        </div>
      </section>

      {/* Demo Section Placeholder */}
      <section className="bg-indigo-900 text-white p-8 rounded-3xl shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Try It Out!</h2>
        <p className="opacity-80 max-w-lg mx-auto">
          Navigate to the <strong>Tracker</strong> tab to log some data, then go to the <strong>Concierge</strong> tab to chat with your agents. 
          Try asking: <em>"Find me a yoga video for stress"</em> or <em>"Analyze my calories for today."</em>
        </p>
      </section>

    </div>
  );
};

export default ProjectWriteup;