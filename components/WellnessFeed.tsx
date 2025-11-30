import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { agentService } from '../services/geminiService';

interface WellnessFeedProps {
  userProfile: UserProfile;
}

const WellnessFeed: React.FC<WellnessFeedProps> = ({ userProfile }) => {
  const [content, setContent] = useState<{ video?: {title: string, url: string}, quote?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      // Pass a generic "good" mood or pull from last log if possible
      const data = await agentService.getDailyContent(userProfile, "motivated");
      setContent(data);
      setLoading(false);
    };
    fetchContent();
  }, [userProfile]);

  // Helper to extract YouTube ID from various URL formats
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="h-40 bg-slate-200 rounded-xl"></div>
        <div className="h-20 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  const videoId = content?.video?.url ? getYouTubeId(content.video.url) : null;

  return (
    <div className="space-y-6 mb-8 animate-fade-in">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quote Section */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-3xl text-white shadow-lg flex flex-col justify-center relative overflow-hidden min-h-[200px]">
          <div className="absolute top-0 right-0 opacity-10 text-9xl font-serif">"</div>
          <h3 className="text-indigo-100 font-medium mb-4 uppercase tracking-widest text-xs">Quote of the Day</h3>
          <blockquote className="text-xl md:text-2xl font-serif italic leading-relaxed relative z-10">
            {content?.quote || "Health is not about the weight you lose, but about the life you gain."}
          </blockquote>
        </div>

        {/* Context Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
           <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                 <span className="bg-red-100 text-red-500 p-2 rounded-lg mr-2 text-sm">📺</span>
                 Daily Selection
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                 Curated for <strong>{userProfile.name}</strong> based on goal:
                 <span className="inline-block bg-slate-100 text-slate-600 px-2 py-0.5 rounded ml-1 text-xs font-medium uppercase">{userProfile.goals[0] || 'General Wellness'}</span>
              </p>
           </div>
           
           {content?.video && (
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
               <p className="text-sm text-slate-400 uppercase tracking-wide font-bold mb-1">Up Next</p>
               <p className="font-medium text-slate-700 line-clamp-2">{content.video.title}</p>
             </div>
           )}
        </div>
      </div>

      {/* Video Player Section */}
      {content?.video && videoId ? (
        <div className="bg-black p-4 rounded-3xl shadow-lg border border-slate-900 overflow-hidden">
           <div className="relative pb-[56.25%] h-0 rounded-xl overflow-hidden bg-slate-900">
              <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={content.video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
              ></iframe>
           </div>
        </div>
      ) : content?.video ? (
        // Fallback if embed ID fails
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
           <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">▶</div>
           <h3 className="font-bold text-slate-800 mb-2">{content.video.title}</h3>
           <p className="text-slate-500 mb-4">We found this video for you, but couldn't load the player right here.</p>
           <a 
             href={content.video.url} 
             target="_blank" 
             rel="noreferrer" 
             className="inline-block bg-red-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-red-700 transition-colors"
           >
             Watch on YouTube
           </a>
        </div>
      ) : null}
    </div>
  );
};

export default WellnessFeed;