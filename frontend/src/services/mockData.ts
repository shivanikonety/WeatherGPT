import { ChatSession, WeatherAlert, WeatherPayload } from '../types/weather';

export const PUNE_WEATHER_DATA: WeatherPayload = {
  location: {
    name: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    latitude: 18.5204,
    longitude: 73.8567,
    timezone: 'Asia/Kolkata',
    localTime: '17:30 IST'
  },
  current: {
    temperature: 24.2,
    feelsLike: 25.8,
    condition: 'Heavy Rain & Thunderstorm',
    description: 'तीव्र गरज-चमक के साथ मानसूनी वर्षा (Heavy Monsoon Showers)',
    icon: 'thunderstorm',
    rainProbability: 92,
    humidity: 89,
    windSpeed: 22,
    windDirection: 'SW (दक्षिण-पश्चिम)',
    windGust: 38,
    uvIndex: 2,
    uvLabel: 'Low (कम)',
    aqi: 38,
    aqiLabel: 'Good (उत्कृष्ट)',
    aqiColor: '#10b981',
    pressure: 1008,
    visibility: 4.5,
    isDay: true
  },
  hourly: [
    { time: '16:00', temperature: 26, feelsLike: 27, rainProbability: 40, precipitation: 1.2, condition: 'Light Rain', icon: 'cloud-rain' },
    { time: '17:00', temperature: 24, feelsLike: 25, rainProbability: 85, precipitation: 6.8, condition: 'Heavy Rain', icon: 'cloud-lightning', isNow: true },
    { time: '18:00', temperature: 23, feelsLike: 24, rainProbability: 95, precipitation: 12.4, condition: 'Thunderstorm', icon: 'cloud-lightning' },
    { time: '19:00', temperature: 22, feelsLike: 23, rainProbability: 90, precipitation: 8.5, condition: 'Heavy Showers', icon: 'cloud-rain' },
    { time: '20:00', temperature: 22, feelsLike: 23, rainProbability: 65, precipitation: 3.1, condition: 'Moderate Rain', icon: 'cloud-rain' },
    { time: '21:00', temperature: 21, feelsLike: 22, rainProbability: 35, precipitation: 0.8, condition: 'Light Drizzle', icon: 'cloud-drizzle' },
    { time: '22:00', temperature: 21, feelsLike: 21, rainProbability: 20, precipitation: 0.0, condition: 'Overcast', icon: 'cloud' },
    { time: '23:00', temperature: 20, feelsLike: 20, rainProbability: 15, precipitation: 0.0, condition: 'Cloudy', icon: 'cloud' }
  ],
  daily: [
    { date: '2026-09-20', dayName: 'आज (Today)', maxTemp: 27, minTemp: 20, rainProbability: 95, condition: 'Thunderstorm', icon: 'cloud-lightning', uvMax: 3 },
    { date: '2026-09-21', dayName: 'सोम (Mon)', maxTemp: 28, minTemp: 21, rainProbability: 80, condition: 'Heavy Rain', icon: 'cloud-rain', uvMax: 4 },
    { date: '2026-09-22', dayName: 'मंगल (Tue)', maxTemp: 29, minTemp: 21, rainProbability: 60, condition: 'Scattered Rain', icon: 'cloud-rain', uvMax: 6 },
    { date: '2026-09-23', dayName: 'बुध (Wed)', maxTemp: 30, minTemp: 22, rainProbability: 40, condition: 'Passing Showers', icon: 'cloud-sun-rain', uvMax: 7 },
    { date: '2026-09-24', dayName: 'गुरु (Thu)', maxTemp: 31, minTemp: 22, rainProbability: 25, condition: 'Partly Cloudy', icon: 'cloud-sun', uvMax: 8 }
  ],
  impact: {
    umbrella: {
      verdict: 'Definite Yes',
      level: 'critical',
      text: 'अवश्य ले जाएं! शाम 5:30 से 8:30 बजे के बीच 90%+ मूसलाधार बारिश की अत्यधिक संभावना है।',
      window: '17:00 – 20:30 IST'
    },
    clothing: {
      layers: 'सिंगल लेयर + रेनकोट / वाटरप्रूफ जैकेट',
      advice: 'हल्के, जल्दी सूखने वाले सिंथेटिक कपड़े पहनें और वाटरप्रूफ फुटवियर का प्रयोग करें।',
      accessories: ['मजबूत छाता / रेनकोट', 'वाटरप्रूफ बैग कवर', 'एंटी-स्लिप जूते']
    },
    activities: {
      running: { score: 15, label: 'प्रतिकूल (Not Recommended)', notes: 'सड़कें बहुत फिसलन भरी हैं और दृश्यता कम है।' },
      cycling: { score: 20, label: 'जोखिम भरा (High Risk)', notes: 'तेज हवा के झोंके (38 km/h) और जलभराव का खतरा।' },
      dining: { score: 75, label: 'इनडोर उत्तम (Indoor Great)', notes: 'कैफे या इनडोर डाइनिंग का लुत्फ उठा सकते हैं।' },
      commute: { score: 30, label: 'सावधानी बरतें (Delays Likely)', notes: 'शिवाजीनगर, हिंजेवाड़ी व एफसी रोड पर ट्रैफिक जाम की संभावना।' }
    },
    health: {
      hydration: 'सामान्य (2.5 लीटर) - तापमान सुखद है।',
      uvCaution: 'UV इंडेक्स 2 (बहुत कम) - सनस्क्रीन की आवश्यकता नहीं।'
    }
  },
  alerts: [
    {
      id: 'pune-alert-01',
      event: 'Severe Thunderstorm & Flash Flood Watch',
      severity: 'danger',
      headline: 'पुणे व पश्चिमी घाट में भारी वर्षा एवं गरज-चमक की चेतावनी',
      description: 'IMD एवं स्थानीय रडार के अनुसार अगले 3 घंटों में 35-50 मिमी तक भारी बारिश और 40 किमी/घंटा की गति से तेज हवाएं चलने का अनुमान है।',
      instruction: 'पेड़ों व बिजली के खंभों के नीचे खड़े होने से बचें। जलभराव वाले निचले अंडरपास से न जाएं।',
      startTime: '17:00 IST',
      expires: '21:30 IST',
      areaDesc: 'पुणे शहर, पिंपरी-चिंचवड़, लवासा एवं पश्चिमी घाट'
    }
  ]
};

export const INITIAL_CHAT_SESSIONS: ChatSession[] = [
  {
    id: 'chat-pune-rain-hindi',
    title: 'पुणे में आज शाम बारिश और छाता सलाह',
    createdAt: '2026-09-20T17:15:00Z',
    updatedAt: '2026-09-20T17:15:45Z',
    category: 'today',
    isPinned: true,
    messages: [
      {
        id: 'msg-user-1',
        role: 'user',
        content: 'क्या आज शाम पुणे में बारिश होगी? मुझे बाहर जाना है, क्या मुझे छाता ले जाना चाहिए?',
        timestamp: '17:15',
        language: 'hi'
      },
      {
        id: 'msg-assistant-1',
        role: 'assistant',
        content: `नमस्ते! **हाँ, आज शाम पुणे में मूसलाधार बारिश होने की 90% से अधिक संभावना है।** आपको निश्चित रूप से **मजबूत छाता या रेनकोट** साथ रखना चाहिए। ☔

### 🌧️ मुख्य मौसम स्थिति (पुणे - शाम का समय):
- **तापमान:** 24°C (अनुभूति: 26°C)
- **बारिश का मुख्य समय:** शाम **5:30 PM से 8:30 PM** के बीच सबसे तीव्र गरज-चमक के साथ बौछारें पड़ने का अनुमान है।
- **हवा की गति:** 22 km/h (झोंके 38 km/h तक)
- **वायु गुणवत्ता (AQI):** 38 (उत्कृष्ट एवं स्वच्छ हवा 🍃)

### 💡 बाहर जाने के लिए महत्वपूर्ण सावधानियां:
1. **वाटरप्रूफ तैयारी:** वाटरप्रूफ बैग कवर और एंटी-स्लिप जूते पहनें।
2. **ट्रैफिक एडवाइजरी:** एफसी रोड, सेनापति बापट रोड और हिंजेवाड़ी फ्लाईओवर पर जलभराव के कारण धीमा ट्रैफिक हो सकता है।
3. **बिजली व सुरक्षा:** तेज गरज-चमक के दौरान खुले मैदान या बड़े पेड़ों के नीचे शरण न लें।

*विस्तृत 24-घंटे का वर्षा टाइमलाइन और एक्टिविटी स्कोर नीचे कार्ड में देखें:*`,
        timestamp: '17:15',
        language: 'hi',
        thoughtProcess: `• यूजर ने हिंदी में पुणे के मौसम और छाता ले जाने की आवश्यकता के बारे में पूछा।
• Open-Meteo और IMD रडार मॉडल से पुणे (18.52°N, 73.85°E) का लाइव डेटा प्राप्त किया: 92% बारिश की संभावना, संवहनीय गरज-चमक (Convective Thunderstorm) 17:00–20:00 IST के बीच चरम पर।
• छाता निर्णय: "अवश्य ले जाएं (Definite Yes)"।
• यूजर की भाषा (हिंदी) में सटीक, सौम्य और व्यावहारिक सलाह तैयार की गई।`,
        weatherData: PUNE_WEATHER_DATA
      }
    ]
  },
  {
    id: 'chat-lonavala-weekend',
    title: 'Weekend Trek in Lonavala & Waterfall Safety',
    createdAt: '2026-09-20T10:30:00Z',
    updatedAt: '2026-09-20T10:32:00Z',
    category: 'today',
    messages: [
      {
        id: 'msg-lona-1',
        role: 'user',
        content: 'Planning a trek to Tiger Point in Lonavala this Sunday. How is the fog and rain hazard?',
        timestamp: '10:30',
        language: 'en'
      },
      {
        id: 'msg-lona-2',
        role: 'assistant',
        content: `### ⛰️ Lonavala Weekend Trekking Forecast (Tiger Point & Ghats)

**Overall Verdict: Moderate Caution Advised 🥾**

- **Rainfall:** Intermittent heavy mist with 75% chance of passing monsoon clouds.
- **Visibility & Fog:** Severe fog expected above 650m altitude in early morning (06:00–09:00 AM), reducing visibility below 50 meters.
- **Trail Traction:** Muddy and slippery basalt rock sections. Trekking poles and high-traction ankle boots are strictly recommended.`,
        timestamp: '10:32',
        language: 'en'
      }
    ]
  },
  {
    id: 'chat-delhi-mumbai-aqi',
    title: 'Delhi vs Mumbai AQI & Flight Weather',
    createdAt: '2026-09-19T14:20:00Z',
    updatedAt: '2026-09-19T14:22:00Z',
    category: 'yesterday',
    messages: [
      {
        id: 'msg-dm-1',
        role: 'user',
        content: 'Compare weather between New Delhi and Mumbai for business travel tomorrow.',
        timestamp: 'Yesterday',
        language: 'en'
      }
    ]
  },
  {
    id: 'chat-manali-snow',
    title: 'Manali Snowfall & Winter Layering Guide',
    createdAt: '2026-09-15T09:00:00Z',
    updatedAt: '2026-09-15T09:05:00Z',
    category: 'previous_7_days',
    messages: [
      {
        id: 'msg-manali-1',
        role: 'user',
        content: 'What clothing layers are required for Solang Valley at -2°C?',
        timestamp: 'Sep 15',
        language: 'en'
      }
    ]
  }
];

export const ACTIVE_SEVERE_ALERT: WeatherAlert = {
  id: 'alert-active-pune-01',
  event: 'Severe Thunderstorm & Waterlogging Warning',
  severity: 'danger',
  headline: '⚡ Severe Weather Alert: Heavy Thunderstorm & Lightning warning for Pune & Western Ghats until 21:30 IST',
  description: 'Convective storm cells detected moving from SW at 28 km/h. Localized heavy rainfall (35-50mm/hr) with wind gusts up to 40 km/h expected across Pune city, PCMC, and highway corridors.',
  instruction: 'Carry rain gear, avoid low-lying underpasses, secure loose outdoor objects, and stay clear of electric poles during active lightning.',
  startTime: '17:00 IST',
  expires: '21:30 IST',
  areaDesc: 'Pune, PCMC, Lonavala & Western Ghats Corridor'
};

export const QUICK_PROMPTS = [
  {
    icon: '🌧️',
    title: 'पुणे में आज शाम बारिश?',
    subtitle: 'क्या बाहर जाते समय छाता चाहिए?',
    query: 'क्या आज शाम पुणे में बारिश होगी? मुझे बाहर जाना है, क्या मुझे छाता ले जाना चाहिए?',
    lang: 'hi'
  },
  {
    icon: '🏃',
    title: 'Morning Running Conditions',
    subtitle: 'Optimal time, humidity & air quality',
    query: 'What is the best time for morning outdoor running tomorrow in Pune?',
    lang: 'en'
  },
  {
    icon: '⚡',
    title: 'Live Thunderstorm & Radar',
    subtitle: 'Track imminent storm cells & rain windows',
    query: 'Check live radar and thunderstorm risk for Mumbai & Western Maharashtra',
    lang: 'en'
  },
  {
    icon: '✈️',
    title: 'Compare Delhi vs Bengaluru',
    subtitle: 'Side-by-side temperature & comfort comparison',
    query: 'Compare the weather in New Delhi and Bengaluru today. Which is more pleasant?',
    lang: 'en'
  }
];
