import React, { useEffect, useState } from 'react';

interface WeatherData {
  temperature: number;
  weathercode: number;
  is_day: number;
}

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geo not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
          );
          if (!res.ok) throw new Error("API Error");
          const data = await res.json();
          setWeather(data.current_weather);
        } catch (err) {
          console.error(err);
          setError('Unavailable');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error(err);
        setError('Location denied');
        setLoading(false);
      }
    );
  }, []);

  // Simple WMO Code interpretation
  const getWeatherInfo = (code: number) => {
    if (code === 0) return { label: 'Sunny', icon: '☀️' };
    if (code <= 3) return { label: 'Cloudy', icon: '⛅' };
    if (code <= 48) return { label: 'Foggy', icon: '🌫️' };
    if (code <= 67) return { label: 'Rain', icon: '🌧️' };
    if (code <= 77) return { label: 'Snow', icon: '❄️' };
    if (code <= 82) return { label: 'Showers', icon: '🌦️' };
    return { label: 'Stormy', icon: '⛈️' };
  };

  if (loading) return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center h-full min-h-[140px]">
      <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  if (error || !weather) return (
     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center h-full min-h-[140px] text-slate-400">
        <span className="text-2xl mb-2">🌦️</span>
        <span className="text-xs font-medium">{error || 'No Data'}</span>
     </div>
  );

  const info = getWeatherInfo(weather.weathercode);

  return (
    <div className="bg-gradient-to-br from-sky-400 to-blue-600 p-6 rounded-2xl shadow-md text-white relative overflow-hidden h-full flex flex-col justify-between min-h-[140px]">
      <div className="flex justify-between items-start z-10">
        <div>
           <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Local Weather</p>
           <h3 className="text-3xl font-bold">{Math.round(weather.temperature)}°C</h3>
        </div>
        <div className="text-4xl drop-shadow-sm">{info.icon}</div>
      </div>
      <div className="z-10 mt-2">
         <p className="font-medium text-lg">{info.label}</p>
      </div>
      {/* Decorative circle */}
      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
    </div>
  );
};

export default WeatherWidget;