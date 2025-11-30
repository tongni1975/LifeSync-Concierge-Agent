import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileSettingsProps {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onUpdateProfile }) => {
  const [formData, setFormData] = useState({
    name: profile.name,
    age: profile.age.toString(),
    goals: profile.goals.join(', ')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      name: formData.name,
      age: Number(formData.age) || 0,
      goals: formData.goals.split(',').map(g => g.trim()).filter(g => g.length > 0)
    };
    onUpdateProfile(updated);
    alert('Profile updated successfully!');
  };

  const inputClasses = "w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all bg-slate-50";
  const labelClasses = "block text-sm font-medium text-slate-600 mb-1";

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Profile Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
           <label className={labelClasses}>Name</label>
           <input
             type="text"
             value={formData.name}
             onChange={e => setFormData({...formData, name: e.target.value})}
             className={inputClasses}
             placeholder="Your Name"
           />
        </div>
        <div>
           <label className={labelClasses}>Age</label>
           <input
             type="number"
             value={formData.age}
             onChange={e => setFormData({...formData, age: e.target.value})}
             className={inputClasses}
             placeholder="Your Age"
           />
        </div>
        <div>
           <label className={labelClasses}>Health & Wellness Goals</label>
           <p className="text-xs text-slate-500 mb-2">Separate multiple goals with commas.</p>
           <textarea
             value={formData.goals}
             onChange={e => setFormData({...formData, goals: e.target.value})}
             className={`${inputClasses} h-32 resize-none`}
             placeholder="e.g. Lose weight, Run 5k, Meditate daily, Drink more water"
           />
           <p className="text-xs text-indigo-500 mt-2">
             <span role="img" aria-label="info">ℹ️</span> These goals are used by the AI Concierge to personalize your experience.
           </p>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg shadow-indigo-100 active:scale-95"
        >
          Save Profile Changes
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;