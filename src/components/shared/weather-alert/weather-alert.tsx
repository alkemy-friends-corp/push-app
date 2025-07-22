import { Cloud, Sun, Shield } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";

export function WeatherAlert() {
  const { t } = useLanguage();
  
  // Mock weather data - in real app this would come from API
  const weatherData = {
    temperature: 23,
    condition: 'partly-cloudy',
    alert: null // Can be 'rain', 'typhoon', 'earthquake', etc.
  };

  const getWeatherIcon = () => {
    switch (weatherData.condition) {
      case 'sunny':
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'partly-cloudy':
        return <Cloud className="h-5 w-5 text-blue-500" />;
      default:
        return <Cloud className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="flex gap-3">
      {/* Weather Info */}
      <div className="flex-1 flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
        {getWeatherIcon()}
        <div>
          <p className="font-medium">{weatherData.temperature}°C</p>
          <p className="text-xs text-muted-foreground">{t('weather.partlyCloudy')}</p>
        </div>
      </div>
      
      {/* Safety Status */}
      <div className="flex-1 flex items-center gap-2 p-3 bg-green-50 rounded-lg">
        <Shield className="h-5 w-5 text-green-600" />
        <p className="text-sm text-green-800">報告なし</p>
      </div>
    </div>
  );
}