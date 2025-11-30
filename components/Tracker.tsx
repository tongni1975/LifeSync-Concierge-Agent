import React, { useState } from 'react';
import { DailyLog, Mood, MealType, Meal } from '../types';
import { agentService } from '../services/geminiService';

interface TrackerProps {
  onAddLog: (log: DailyLog) => void;
}

const Tracker: React.FC<TrackerProps> = ({ onAddLog }) => {
  const [formData, setFormData] = useState({
    mood: Mood.Okay,
    heartRate: '',
    exerciseMinutes: '',
    notes: ''
  });
  
  // Food Tracker State
  const [meals, setMeals] = useState<Meal[]>([]);
  const [currentMealType, setCurrentMealType] = useState<MealType>(MealType.Breakfast);
  const [foodInput, setFoodInput] = useState('');
  const [calculating, setCalculating] = useState(false);

  const totalCalories = meals.reduce((acc, meal) => acc + meal.calories, 0);

  const handleCalculateAndAdd = async () => {
    if (!foodInput) return;
    setCalculating(true);
    try {
      const result = await agentService.estimateCalories(foodInput);
      const newMeal: Meal = {
        id: Date.now().toString(),
        type: currentMealType,
        description: foodInput,
        calories: result.calories
      };
      setMeals([...meals, newMeal]);
      setFoodInput('');
    } catch (e) {
      alert("Failed to calculate calories.");
    } finally {
      setCalculating(false);
    }
  };

  const removeMeal = (id: string) => {
    setMeals(meals.filter(m => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: DailyLog = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mood: formData.mood,
      heartRate: Number(formData.heartRate) || 0,
      caloriesIn: totalCalories,
      exerciseMinutes: Number(formData.exerciseMinutes) || 0,
      notes: formData.notes,
      meals: meals
    };
    onAddLog(newLog);
    // Reset form
    setFormData({
      mood: Mood.Okay,
      heartRate: '',
      exerciseMinutes: '',
      notes: ''
    });
    setMeals([]);
    alert("Log saved successfully!");
  };

  const inputClasses = "w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all bg-slate-50";
  const labelClasses = "block text-sm font-medium text-slate-600 mb-1";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      
      {/* Food Entry Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
          <span className="bg-orange-100 text-orange-600 p-2 rounded-lg mr-3 text-lg">🍎</span>
          Smart Food Tracker
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <select 
            value={currentMealType}
            onChange={(e) => setCurrentMealType(e.target.value as MealType)}
            className="p-3 rounded-xl border border-slate-200 bg-slate-50 min-w-[120px]"
          >
            {Object.values(MealType).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="flex-1 flex gap-2">
            <input 
              type="text"
              value={foodInput}
              onChange={(e) => setFoodInput(e.target.value)}
              placeholder="e.g. 2 slices of pepperoni pizza"
              className={inputClasses}
              onKeyDown={(e) => e.key === 'Enter' && handleCalculateAndAdd()}
            />
            <button 
              type="button"
              onClick={handleCalculateAndAdd}
              disabled={calculating || !foodInput}
              className="bg-indigo-600 text-white px-6 rounded-xl font-medium disabled:opacity-50 hover:bg-indigo-700 transition-colors whitespace-nowrap"
            >
              {calculating ? 'Analyzing...' : 'Add Meal'}
            </button>
          </div>
        </div>

        {/* Meal List */}
        {meals.length > 0 && (
          <div className="space-y-2 mb-4 bg-slate-50 p-4 rounded-xl">
            {meals.map(meal => (
              <div key={meal.id} className="flex justify-between items-center text-sm border-b border-slate-200 last:border-0 pb-2 last:pb-0">
                <div>
                  <span className="font-bold text-slate-600 mr-2">{meal.type}:</span>
                  <span className="text-slate-800">{meal.description}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-orange-500">{meal.calories} kcal</span>
                  <button onClick={() => removeMeal(meal.id)} className="text-slate-400 hover:text-red-500">×</button>
                </div>
              </div>
            ))}
            <div className="pt-2 text-right font-bold text-lg text-slate-800">
              Total: <span className="text-orange-600">{totalCalories} kcal</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Stats Form */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3 text-lg">📝</span>
          Daily Check-in
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>Current Mood</label>
              <select 
                value={formData.mood}
                onChange={(e) => setFormData({...formData, mood: e.target.value as Mood})}
                className={inputClasses}
              >
                {Object.values(Mood).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClasses}>Heart Rate (BPM)</label>
              <input 
                type="number" 
                value={formData.heartRate}
                onChange={(e) => setFormData({...formData, heartRate: e.target.value})}
                className={inputClasses}
                placeholder="e.g. 72"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Read-only total calories */}
            <div>
              <label className={labelClasses}>Total Calories (Calculated)</label>
              <input 
                type="number" 
                value={totalCalories}
                readOnly
                className={`${inputClasses} bg-slate-100 text-slate-500`}
              />
            </div>

            <div>
              <label className={labelClasses}>Exercise (Minutes)</label>
              <input 
                type="number" 
                value={formData.exerciseMinutes}
                onChange={(e) => setFormData({...formData, exerciseMinutes: e.target.value})}
                className={inputClasses}
                placeholder="e.g. 45"
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Notes / Journal</label>
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className={`${inputClasses} h-24 resize-none`}
              placeholder="How did you feel today?"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-indigo-100"
          >
            Save Daily Log
          </button>
        </form>
      </div>
    </div>
  );
};

export default Tracker;