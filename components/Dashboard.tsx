import React from 'react';
import { DailyLog, Mood, UserProfile } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
  AreaChart, Area
} from 'recharts';
import WeatherWidget from './WeatherWidget';

interface DashboardProps {
  logs: DailyLog[];
  userProfile: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ logs, userProfile }) => {
  // Sort logs by date
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Helper to map mood to number for charting
  const moodToScore = (mood: Mood) => {
    switch (mood) {
      case Mood.Great: return 5;
      case Mood.Good: return 4;
      case Mood.Okay: return 3;
      case Mood.Low: return 2;
      case Mood.Stressed: return 1;
      default: return 3;
    }
  };

  const chartData = sortedLogs.map(log => ({
    date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    calories: log.caloriesIn,
    moodScore: moodToScore(log.mood),
    heartRate: log.heartRate,
    exercise: log.exerciseMinutes
  }));

  // --- Summary Statistics ---
  const avgCalories = chartData.length > 0 
    ? Math.round(chartData.reduce((acc, curr) => acc + curr.calories, 0) / chartData.length) 
    : 0;
    
  const totalExercise = chartData.reduce((acc, curr) => acc + curr.exercise, 0);

  // --- Goal Analysis ---
  // Simple heuristic to determine what to visualize based on the first goal
  const mainGoal = userProfile.goals[0]?.toLowerCase() || 'wellness';
  let goalMetric = 'exercise';
  let goalLabel = 'Exercise Minutes';
  let goalTarget = 30; // default target
  let goalColor = '#10b981';

  if (mainGoal.includes('weight') || mainGoal.includes('diet') || mainGoal.includes('eat')) {
    goalMetric = 'calories';
    goalLabel = 'Calorie Intake';
    goalTarget = 2000;
    goalColor = '#f97316';
  } else if (mainGoal.includes('stress') || mainGoal.includes('mood') || mainGoal.includes('mind')) {
    goalMetric = 'moodScore';
    goalLabel = 'Mood Score';
    goalTarget = 4;
    goalColor = '#6366f1';
  }

  // Calculate generic progress percentage based on the last log vs target
  const lastLog = chartData[chartData.length - 1];
  const currentMetricValue = lastLog ? (lastLog as any)[goalMetric] : 0;
  const progressPercent = Math.min(100, Math.round((currentMetricValue / goalTarget) * 100));

  // --- Consistency Streak ---
  // Check the last 7 days
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const loggedDates = new Set(sortedLogs.map(l => l.date.split('T')[0]));
  const consistencyData = last7Days.map(date => ({
    day: new Date(date).toLocaleDateString(undefined, { weekday: 'narrow' }),
    isLogged: loggedDates.has(date)
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Goal Progress Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <span className="bg-purple-100 text-purple-600 p-1.5 rounded-lg mr-2 text-sm">🎯</span>
              Goal Progress: <span className="ml-2 font-normal text-slate-600 capitalize">{userProfile.goals[0] || 'Stay Healthy'}</span>
            </h3>
            <p className="text-sm text-slate-400 mt-1">Tracking your daily consistency and key metrics.</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
             {consistencyData.map((day, idx) => (
               <div key={idx} className="flex flex-col items-center gap-1">
                 <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    day.isLogged ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-300'
                  }`}
                 >
                   {day.isLogged ? '✓' : ''}
                 </div>
                 <span className="text-[10px] text-slate-400 font-medium uppercase">{day.day}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Goal Metric Bar */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daily Target ({goalLabel})</span>
              <div className="text-2xl font-bold text-slate-800">
                {currentMetricValue} <span className="text-sm text-slate-400 font-medium">/ {goalTarget}</span>
              </div>
            </div>
            <span className="text-xl font-bold" style={{ color: goalColor }}>{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%`, backgroundColor: goalColor }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-3 text-right">
            Based on your latest log entry.
          </p>
        </div>
      </div>

      {/* Summary Cards Row including Weather */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weather Widget (New) */}
        <WeatherWidget />

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center min-h-[140px]">
          <p className="text-slate-500 text-sm font-medium">Avg Calories (Daily)</p>
          <p className="text-3xl font-bold text-orange-500">{avgCalories} <span className="text-sm text-slate-400">kcal</span></p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center min-h-[140px]">
          <p className="text-slate-500 text-sm font-medium">Total Exercise</p>
          <p className="text-3xl font-bold text-emerald-500">{totalExercise} <span className="text-sm text-slate-400">mins</span></p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center min-h-[140px]">
          <p className="text-slate-500 text-sm font-medium">Latest Mood</p>
          <p className="text-3xl font-bold text-indigo-500">{logs[logs.length - 1]?.mood || 'N/A'}</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calorie & Exercise Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-80">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Physical Metrics</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" orientation="left" stroke="#f97316" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="calories" name="Calories" fill="#f97316" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar yAxisId="right" dataKey="exercise" name="Exercise (min)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mood & Heart Rate */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-80">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Wellness & Vitals</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" orientation="left" domain={[0, 6]} hide />
              <YAxis yAxisId="right" orientation="right" domain={[40, 180]} stroke="#ef4444" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="moodScore" name="Mood Lvl" stroke="#6366f1" fillOpacity={1} fill="url(#colorMood)" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="heartRate" name="Heart Rate" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;