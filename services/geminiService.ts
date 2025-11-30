import { GoogleGenAI, Type } from "@google/genai";
import { DailyLog, UserProfile, AgentPersona, AgentResponse } from "../types";

// Define the shape of the output for the Orchestrator
interface OrchestratorDecision {
  targetAgent: AgentPersona;
  reasoning: string;
}

/**
 * Service to handle multi-agent interactions using Gemini.
 * Implements the "Manager" pattern where an orchestrator delegates to sub-agents.
 */
class AgentService {
  private ai: GoogleGenAI;

  constructor() {
    // API Key is injected via environment variable as per instructions
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * Generates a creative thumbnail image for the application using Gemini Image Generation.
   */
  async generateThumbnail(): Promise<string | null> {
    const prompt = `
      A cinematic, high-tech 3D isometric illustration of the "LifeSync Concierge" health app.
      
      Visual elements:
      1. A central glowing AI core (representing the Orchestrator Agent).
      2. Floating holographic data screens showing Heart Rate graphs (red), Nutrition info with an apple icon (green), and a Zen/Meditation symbol (purple).
      3. A sleek, modern dashboard interface in the background.
      
      Style: Cyberpunk meets Clean Health Tech. 
      Lighting: Neon accents in Indigo, Emerald, and Violet against a deep slate background. 
      Quality: 8k resolution, highly detailed, photorealistic rendering, trending on ArtStation.
    `;

    try {
      // Using gemini-2.5-flash-image for general image generation
      // Configured for 16:9 aspect ratio to ensure dimensions > 560x280
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: '16:9'
          }
        }
      });

      // Iterate through parts to find the image
      const candidates = response.candidates;
      if (candidates && candidates.length > 0) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
      return null;
    } catch (e) {
      console.error("Error generating thumbnail", e);
      return null;
    }
  }

  /**
   * Estimates calories for a given food description using the Nutritionist Persona.
   */
  async estimateCalories(foodDescription: string): Promise<{ calories: number; details: string }> {
    const prompt = `
      You are a Nutritionist. Estimate the calories for: "${foodDescription}".
      Return ONLY a JSON object with this structure: { "calories": number, "details": "short explanation" }.
      Do not add markdown formatting.
    `;
    
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      
      const text = response.text || "{}";
      return JSON.parse(text);
    } catch (e) {
      console.error("Error estimating calories", e);
      return { calories: 0, details: "Could not estimate" };
    }
  }

  /**
   * Fetches daily wellness content (Video + Quote) using Search Grounding.
   */
  async getDailyContent(userProfile: UserProfile, mood: string): Promise<{ video?: {title: string, url: string}, quote?: string }> {
    const prompt = `
      Find a motivational YouTube video for someone who feels ${mood} and whose goal is ${userProfile.goals[0] || 'wellness'}.
      Also find a motivational quote from a famous author about health or life.
      Use Google Search to find real video links and quotes.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      let video = undefined;
      
      if (chunks) {
        // Simple heuristic to find a video link
        const videoChunk = chunks.find((c: any) => c.web?.uri?.includes('youtube.com'));
        if (videoChunk && videoChunk.web) {
          video = { title: videoChunk.web.title, url: videoChunk.web.uri };
        }
      }

      return {
        video,
        quote: response.text
      };

    } catch (e) {
      console.error("Error getting daily content", e);
      return { quote: "Keep going, you're doing great!" };
    }
  }

  /**
   * Main entry point. Decides which agent should handle the request and executes it.
   */
  async processRequest(
    userQuery: string,
    history: DailyLog[],
    profile: UserProfile
  ): Promise<AgentResponse> {
    
    // 1. Context Compaction: Summarize recent history for the prompt
    const recentHistoryContext = history
      .slice(-5) // Last 5 days
      .map(h => `Date: ${h.date}, Mood: ${h.mood}, Calories: ${h.caloriesIn}, Exercise: ${h.exerciseMinutes}min, HR: ${h.heartRate}bpm`)
      .join('\n');

    const userContext = `User: ${profile.name}, Age: ${profile.age}, Goals: ${profile.goals.join(', ')}`;

    // 2. Orchestrator Agent: Decides routing
    // Using a simpler prompt-based routing for speed and reliability
    const routingPrompt = `
      You are the Head Concierge of a health app.
      User Profile: ${userContext}
      Recent Stats: ${recentHistoryContext}
      
      User Query: "${userQuery}"
      
      Classify the query into one of these agents:
      - Nutritionist (food, calories, diet advice)
      - Trainer (exercise, heart rate, workouts, physical stats)
      - WellnessCoach (mood, motivation, mental health, find videos, quotes, general chat)
      
      Return ONLY the agent name.
    `;

    // Fast inference for routing
    const routingResponse = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: routingPrompt,
    });
    
    const decisionText = routingResponse.text?.trim();
    let selectedAgent = AgentPersona.WellnessCoach; // Default

    if (decisionText?.toLowerCase().includes('nutrition')) selectedAgent = AgentPersona.Nutritionist;
    else if (decisionText?.toLowerCase().includes('trainer')) selectedAgent = AgentPersona.Trainer;
    
    console.log(`Orchestrator routed to: ${selectedAgent}`);

    // 3. Execute Specific Agent Logic
    switch (selectedAgent) {
      case AgentPersona.Nutritionist:
        return this.runNutritionAgent(userQuery, userContext, recentHistoryContext);
      case AgentPersona.Trainer:
        return this.runTrainerAgent(userQuery, userContext, recentHistoryContext);
      case AgentPersona.WellnessCoach:
      default:
        return this.runWellnessAgent(userQuery, userContext, recentHistoryContext);
    }
  }

  private async runNutritionAgent(query: string, userCtx: string, histCtx: string): Promise<AgentResponse> {
    const systemInstruction = `
      You are an expert Clinical Nutritionist. 
      Analyze the user's dietary questions based on their stats.
      Be concise, scientific, yet encouraging. Focus on macronutrients and sustainable habits.
      
      CRITICAL INSTRUCTION:
      If the user mentions specific foods or asks for calorie/macro estimates, you MUST include a JSON block at the very start of your response wrapped in triple backticks with the label 'nutrition'.
      Format:
      \`\`\`nutrition
      {
        "item": "Food Name",
        "calories": 0,
        "macros": "Protein: Xg, Carbs: Yg, Fat: Zg"
      }
      \`\`\`
      Then provide your text explanation after the block.
      
      User Context: ${userCtx}
      Recent History: ${histCtx}
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: { systemInstruction }
    });

    return {
      text: response.text || "I couldn't process that nutritional query.",
      agent: AgentPersona.Nutritionist
    };
  }

  private async runTrainerAgent(query: string, userCtx: string, histCtx: string): Promise<AgentResponse> {
    const systemInstruction = `
      You are a high-performance Personal Trainer.
      Focus on heart rate zones, recovery, and progressive overload.
      If the user's heart rate is high in history, suggest recovery.
      User Context: ${userCtx}
      Recent History: ${histCtx}
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: { systemInstruction }
    });

    return {
      text: response.text || "I couldn't generate a workout plan.",
      agent: AgentPersona.Trainer
    };
  }

  /**
   * Wellness Agent uses Google Search Grounding to find videos and quotes.
   */
  private async runWellnessAgent(query: string, userCtx: string, histCtx: string): Promise<AgentResponse> {
    const systemInstruction = `
      You are a empathetic Wellness Coach.
      Your goal is to improve the user's mood and mental state.
      If asked for videos, music, or quotes, use the Search tool to find actual links.
      Always try to provide a "Daily Video Selection" from YouTube if the user asks for recommendations.
      User Context: ${userCtx}
      Recent History: ${histCtx}
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }] // Key Feature: Built-in Tool
      }
    });

    // Extract grounding links
    const links: Array<{ title: string; url: string }> = [];
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          links.push({ title: chunk.web.title, url: chunk.web.uri });
        }
      });
    }

    return {
      text: response.text || "I'm here to support your wellness journey.",
      agent: AgentPersona.WellnessCoach,
      links: links
    };
  }
}

export const agentService = new AgentService();