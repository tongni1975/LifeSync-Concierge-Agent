export enum Mood {
  Great = 'Great',
  Good = 'Good',
  Okay = 'Okay',
  Low = 'Low',
  Stressed = 'Stressed'
}

export enum MealType {
  Breakfast = 'Breakfast',
  Lunch = 'Lunch',
  Dinner = 'Dinner',
  Snack = 'Snack'
}

export interface Meal {
  id: string;
  type: MealType;
  description: string;
  calories: number;
}

export interface DailyLog {
  id: string;
  date: string;
  mood: Mood;
  heartRate: number; // bpm
  caloriesIn: number;
  exerciseMinutes: number;
  notes: string;
  meals?: Meal[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  agentName?: string; // Which sub-agent responded
  groundingLinks?: Array<{ title: string; url: string }>;
}

export interface UserProfile {
  name: string;
  age: number;
  goals: string[]; // e.g., "lose weight", "run 5k"
}

export enum AgentPersona {
  Orchestrator = 'Orchestrator',
  Nutritionist = 'Nutritionist',
  Trainer = 'Trainer',
  WellnessCoach = 'WellnessCoach'
}

export interface AgentResponse {
  text: string;
  agent: AgentPersona;
  links?: Array<{ title: string; url: string }>;
}