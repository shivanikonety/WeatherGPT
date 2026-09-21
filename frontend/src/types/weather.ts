export interface LocationInfo {
  name: string;
  country?: string;
  state?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  localTime?: string;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  condition: string;
  description: string;
  icon: string;
  rainProbability: number;
  humidity: number;
  windSpeed: number;
  windDirection?: string;
  windGust?: number;
  uvIndex: number;
  uvLabel?: string;
  aqi: number;
  aqiLabel: string;
  aqiColor: string;
  pressure: number;
  visibility: number;
  isDay: boolean;
}

export interface HourlyForecast {
  time: string; // e.g. "17:00"
  fullTime?: string;
  temperature: number;
  feelsLike: number;
  rainProbability: number;
  precipitation?: number; // mm
  condition: string;
  icon: string;
  isNow?: boolean;
}

export interface DailyForecast {
  date: string;
  dayName: string;
  maxTemp: number;
  minTemp: number;
  rainProbability: number;
  condition: string;
  icon: string;
  uvMax?: number;
}

export interface WeatherImpact {
  umbrella: {
    verdict: 'Definite Yes' | 'Recommended' | 'Standby' | 'Not Needed';
    level: 'critical' | 'warning' | 'info' | 'good';
    text: string;
    window?: string;
  };
  clothing: {
    layers: string;
    advice: string;
    accessories: string[];
  };
  activities: {
    running: { score: number; label: string; notes: string };
    cycling: { score: number; label: string; notes: string };
    dining: { score: number; label: string; notes: string };
    commute: { score: number; label: string; notes: string };
  };
  health: {
    hydration: string;
    uvCaution: string;
  };
}

export interface WeatherAlert {
  id: string;
  event: string;
  severity: 'danger' | 'warning' | 'watch' | 'advisory';
  headline: string;
  description: string;
  instruction?: string;
  startTime?: string;
  expires?: string;
  areaDesc?: string;
}

export interface WeatherPayload {
  location: LocationInfo;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  impact: WeatherImpact;
  alerts?: WeatherAlert[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language?: string;
  weatherData?: WeatherPayload;
  thoughtProcess?: string;
  isStreaming?: boolean;
  error?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  category: 'today' | 'yesterday' | 'previous_7_days' | 'older';
  isPinned?: boolean;
}

export interface UserSettings {
  unit: 'metric' | 'imperial';
  language: string;
  autoDetectLanguage: boolean;
  defaultCity: string;
  defaultLat: number;
  defaultLon: number;
  voiceRate: number;
  thinkingMode: boolean;
  highContrast: boolean;
  theme: 'dark' | 'black';
}
