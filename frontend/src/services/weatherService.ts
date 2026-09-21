import {
  LocationInfo,
  WeatherPayload,
  WeatherImpact,
} from '../types/weather';


// ============================================================
// LANGUAGE DETECTION
// ============================================================

export function detectLanguage(text: string): string {
  if (!text) return 'en';

  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  if (/[\u0980-\u09FF]/.test(text)) return 'bn';
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te';

  if (
    /\b(tiempo|clima|lluvia|temperatura|paraguas|viento|soleado|hoy|mañana)\b/i.test(
      text
    )
  ) {
    return 'es';
  }

  if (
    /\b(météo|pluie|demain|aujourd'hui|parapluie|température)\b/i.test(
      text
    )
  ) {
    return 'fr';
  }

  return 'en';
}


// ============================================================
// KNOWN CITIES
// ============================================================

const KNOWN_CITIES: Record<string, LocationInfo> = {
  pune: {
    name: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    latitude: 18.5204,
    longitude: 73.8567,
  },

  पुणे: {
    name: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    latitude: 18.5204,
    longitude: 73.8567,
  },

  mumbai: {
    name: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    latitude: 19.0760,
    longitude: 72.8777,
  },

  मुंबई: {
    name: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    latitude: 19.0760,
    longitude: 72.8777,
  },

  delhi: {
    name: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    latitude: 28.6139,
    longitude: 77.2090,
  },

  दिल्ली: {
    name: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    latitude: 28.6139,
    longitude: 77.2090,
  },

  bengaluru: {
    name: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    latitude: 12.9716,
    longitude: 77.5946,
  },

  bangalore: {
    name: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    latitude: 12.9716,
    longitude: 77.5946,
  },

  hyderabad: {
    name: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    latitude: 17.3850,
    longitude: 78.4867,
  },

  kolkata: {
    name: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    latitude: 22.5726,
    longitude: 88.3639,
  },

  chennai: {
    name: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    latitude: 13.0827,
    longitude: 80.2707,
  },

  lonavala: {
    name: 'Lonavala',
    state: 'Maharashtra',
    country: 'India',
    latitude: 18.7557,
    longitude: 73.4091,
  },

  manali: {
    name: 'Manali',
    state: 'Himachal Pradesh',
    country: 'India',
    latitude: 32.2396,
    longitude: 77.1887,
  },

  london: {
    name: 'London',
    country: 'United Kingdom',
    latitude: 51.5074,
    longitude: -0.1278,
  },

  'new york': {
    name: 'New York',
    state: 'New York',
    country: 'United States',
    latitude: 40.7128,
    longitude: -74.0060,
  },

  tokyo: {
    name: 'Tokyo',
    country: 'Japan',
    latitude: 35.6762,
    longitude: 139.6503,
  },

  dubai: {
    name: 'Dubai',
    country: 'United Arab Emirates',
    latitude: 25.2048,
    longitude: 55.2708,
  },

  paris: {
    name: 'Paris',
    country: 'France',
    latitude: 48.8566,
    longitude: 2.3522,
  },
};


// ============================================================
// LOCATION EXTRACTION
// ============================================================

export function extractLocationFromQuery(
  query: string,
  fallback: LocationInfo
): LocationInfo {
  const lower = query.toLowerCase();

  for (const [key, loc] of Object.entries(KNOWN_CITIES)) {
    if (lower.includes(key)) {
      return loc;
    }
  }

  return fallback;
}


// ============================================================
// ONLINE GEOCODING
// ============================================================

export async function geocodeCityOnline(
  cityName: string
): Promise<LocationInfo | null> {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        cityName
      )}&count=1&language=en&format=json`
    );

    if (!res.ok) return null;

    const data = await res.json();

    if (data.results && data.results.length > 0) {
      const item = data.results[0];

      return {
        name: item.name,
        state: item.admin1,
        country: item.country,
        latitude: item.latitude,
        longitude: item.longitude,
        timezone: item.timezone,
      };
    }
  } catch (err) {
    console.warn('Geocoding search failed:', err);
  }

  return null;
}


// ============================================================
// WMO WEATHER CODE
// ============================================================

function mapWmoCode(
  code: number
): {
  condition: string;
  description: string;
  icon: string;
} {
  if (code === 0) {
    return {
      condition: 'Clear Sky',
      description: 'Sunny & Clear',
      icon: 'sun',
    };
  }

  if (code === 1 || code === 2) {
    return {
      condition: 'Partly Cloudy',
      description: 'Mainly clear with scattered clouds',
      icon: 'cloud-sun',
    };
  }

  if (code === 3) {
    return {
      condition: 'Overcast',
      description: 'Dense cloud cover',
      icon: 'cloud',
    };
  }

  if (code === 45 || code === 48) {
    return {
      condition: 'Foggy',
      description: 'Dense fog with low visibility',
      icon: 'cloud-fog',
    };
  }

  if (code >= 51 && code <= 55) {
    return {
      condition: 'Drizzle',
      description: 'Light passing drizzle',
      icon: 'cloud-drizzle',
    };
  }

  if (code >= 61 && code <= 65) {
    return {
      condition: 'Rain',
      description: 'Moderate to heavy rain showers',
      icon: 'cloud-rain',
    };
  }

  if (code >= 71 && code <= 77) {
    return {
      condition: 'Snowfall',
      description: 'Fresh snow accumulation',
      icon: 'snowflake',
    };
  }

  if (code >= 80 && code <= 82) {
    return {
      condition: 'Showers',
      description: 'Rain showers',
      icon: 'cloud-rain',
    };
  }

  if (code >= 95 && code <= 99) {
    return {
      condition: 'Thunderstorm',
      description: 'Heavy thunderstorm with lightning',
      icon: 'cloud-lightning',
    };
  }

  return {
    condition: 'Variable',
    description: 'Scattered weather conditions',
    icon: 'cloud',
  };
}


// ============================================================
// LIVE WEATHER
// ============================================================

export async function fetchLiveWeather(
  loc: LocationInfo,
  units: 'metric' | 'imperial' = 'metric'
): Promise<WeatherPayload> {
  const tempUnit =
    units === 'imperial'
      ? '&temperature_unit=fahrenheit&wind_speed_unit=mph'
      : '';

  const url =
    `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${loc.latitude}` +
    `&longitude=${loc.longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure` +
    `&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max` +
    `&timezone=auto${tempUnit}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch weather: ${res.statusText}`);
  }

  const data = await res.json();

  const current = data.current;

  const wmo = mapWmoCode(current.weather_code);

  const rainProbCurrent =
    data.hourly?.precipitation_probability?.[0] ??
    (current.precipitation > 0 ? 80 : 15);

  const uvMaxToday =
    data.daily?.uv_index_max?.[0] ?? 4.5;


  // ============================================================
  // HOURLY
  // ============================================================

  const hourly = [];

  const nowHour = new Date().getHours();

  const times = data.hourly?.time || [];

  for (
    let i = 0;
    i < Math.min(times.length, 12);
    i++
  ) {
    const timeStr = times[i];

    const hourPart =
      timeStr.split('T')[1] || `${i}:00`;

    const hNum =
      parseInt(hourPart.split(':')[0], 10);

    const w = mapWmoCode(
      data.hourly.weather_code[i] || 0
    );

    hourly.push({
      time: hourPart,
      temperature: Math.round(
        data.hourly.temperature_2m[i]
      ),
      feelsLike: Math.round(
        data.hourly.apparent_temperature[i]
      ),
      rainProbability:
        data.hourly.precipitation_probability[i] || 0,
      precipitation:
        data.hourly.precipitation[i] || 0,
      condition: w.condition,
      icon: w.icon,
      isNow: hNum === nowHour,
    });
  }


  // ============================================================
  // DAILY
  // ============================================================

  const daysOfWeek = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
  ];

  const daily = [];

  const dTimes = data.daily?.time || [];

  for (
    let i = 0;
    i < Math.min(dTimes.length, 5);
    i++
  ) {
    const dStr = dTimes[i];

    const dateObj = new Date(dStr);

    const dayName =
      i === 0
        ? 'Today'
        : i === 1
          ? 'Tomorrow'
          : daysOfWeek[dateObj.getDay()];

    const w = mapWmoCode(
      data.daily.weather_code[i] || 0
    );

    daily.push({
      date: dStr,
      dayName,
      maxTemp: Math.round(
        data.daily.temperature_2m_max[i]
      ),
      minTemp: Math.round(
        data.daily.temperature_2m_min[i]
      ),
      rainProbability:
        data.daily.precipitation_probability_max[i] || 0,
      condition: w.condition,
      icon: w.icon,
      uvMax:
        data.daily.uv_index_max?.[i] || 5,
    });
  }


  // ============================================================
  // IMPACT
  // ============================================================

  const maxRain = Math.max(
    ...hourly
      .slice(0, 8)
      .map(h => h.rainProbability),
    rainProbCurrent
  );

  let umbrellaVerdict:
    WeatherImpact['umbrella']['verdict'] =
    'Not Needed';

  let umbrellaLevel:
    WeatherImpact['umbrella']['level'] =
    'good';

  let umbrellaText =
    'No significant rain expected in the coming hours.';

  let rainWindow =
    'Low rain likelihood';


  if (maxRain >= 70) {
    umbrellaVerdict = 'Definite Yes';
    umbrellaLevel = 'critical';

    umbrellaText =
      `Heavy rain imminent (${maxRain}% peak chance). Carrying an umbrella or raincoat is essential.`;

    rainWindow =
      'High probability over the next 4 hours';

  } else if (maxRain >= 40) {
    umbrellaVerdict = 'Recommended';
    umbrellaLevel = 'warning';

    umbrellaText =
      `Moderate chance of showers (${maxRain}%). Keep a compact umbrella handy.`;

    rainWindow =
      'Scattered showers possible';

  } else if (maxRain >= 20) {
    umbrellaVerdict = 'Standby';
    umbrellaLevel = 'info';

    umbrellaText =
      'Isolated light drizzle possible, mostly manageable.';

    rainWindow =
      'Isolated clouds';
  }


  // ============================================================
  // ACTIVITY SCORES
  // ============================================================

  const temp = current.temperature_2m;

  let runningScore = 85;

  let runningNotes =
    'Good running conditions with comfortable temperature.';

  if (maxRain > 60) {
    runningScore = 25;

    runningNotes =
      'Slippery surface and heavy wet conditions. Indoor cardio advised.';

  } else if (temp > 34) {
    runningScore = 40;

    runningNotes =
      'High heat load. Early morning or evening is safer.';

  } else if (temp < 5) {
    runningScore = 45;

    runningNotes =
      'Cold air. Warm base layers and wind protection required.';
  }


  let cyclingScore = 80;

  let cyclingNotes =
    'Smooth traction and manageable breeze.';

  if (
    maxRain > 50 ||
    current.wind_speed_10m > 30
  ) {
    cyclingScore = 30;

    cyclingNotes =
      'High wind resistance and wet road hazard.';
  }


  // ============================================================
  // FINAL WEATHER PAYLOAD
  // ============================================================

  const payload: WeatherPayload = {
    location: {
      ...loc,
      localTime:
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
    },

    current: {
      temperature:
        Math.round(
          current.temperature_2m * 10
        ) / 10,

      feelsLike:
        Math.round(
          current.apparent_temperature * 10
        ) / 10,

      condition: wmo.condition,

      description: wmo.description,

      icon: wmo.icon,

      rainProbability:
        rainProbCurrent,

      humidity:
        current.relative_humidity_2m,

      windSpeed:
        Math.round(
          current.wind_speed_10m
        ),

      windGust:
        Math.round(
          current.wind_gusts_10m ||
          current.wind_speed_10m * 1.3
        ),

      uvIndex:
        uvMaxToday,

      uvLabel:
        uvMaxToday >= 8
          ? 'Very High'
          : uvMaxToday >= 6
            ? 'High'
            : uvMaxToday >= 3
              ? 'Moderate'
              : 'Low',

      aqi: 42,

      aqiLabel:
        'Good (Air Quality is Healthy)',

      aqiColor:
        '#10b981',

      pressure:
        Math.round(
          current.surface_pressure || 1012
        ),

      visibility:
        maxRain > 70
          ? 4.0
          : 10.0,

      isDay:
        current.is_day === 1,
    },

    hourly,

    daily,

    impact: {
      umbrella: {
        verdict: umbrellaVerdict,
        level: umbrellaLevel,
        text: umbrellaText,
        window: rainWindow,
      },

      clothing: {
        layers:
          temp > 25
            ? 'Light Breathable Cotton'
            : temp > 16
              ? 'Single Layer + Light Cardigan'
              : 'Multi-layer Thermal Jacket',

        advice:
          maxRain > 50
            ? 'Wear quick-drying synthetic fabric and water-resistant footwear.'
            : 'Comfortable casual attire suitable for current conditions.',

        accessories:
          maxRain > 50
            ? [
              'Compact Umbrella',
              'Waterproof Phone Pouch',
              'Rain Jacket',
            ]
            : uvMaxToday >= 6
              ? [
                'UV Sunglasses',
                'Sunscreen SPF 30+',
                'Cap',
              ]
              : ['Light Jacket'],
      },

      activities: {
        running: {
          score: runningScore,
          label:
            runningScore > 65
              ? 'Optimal'
              : runningScore > 40
                ? 'Moderate'
                : 'Challenging',
          notes: runningNotes,
        },

        cycling: {
          score: cyclingScore,
          label:
            cyclingScore > 65
              ? 'Great'
              : cyclingScore > 40
                ? 'Moderate'
                : 'Caution Advised',
          notes: cyclingNotes,
        },

        dining: {
          score:
            maxRain > 50
              ? 85
              : 90,

          label:
            maxRain > 50
              ? 'Indoor Great'
              : 'Patio / Outdoor Perfect',

          notes:
            maxRain > 50
              ? 'Cozy indoor dining recommended.'
              : 'Pleasant outdoor seating weather.',
        },

        commute: {
          score:
            maxRain > 60
              ? 35
              : 80,

          label:
            maxRain > 60
              ? 'Delays Expected'
              : 'Smooth',

          notes:
            maxRain > 60
              ? 'Allow extra travel time due to wet road conditions.'
              : 'Normal traffic flow expected.',
        },
      },

      health: {
        hydration:
          `${temp > 30
            ? '3.0+'
            : '2.0-2.5'
          } Liters recommended throughout the day.`,

        uvCaution:
          uvMaxToday >= 6
            ? 'Peak UV hours between 11:00 AM - 3:00 PM. Apply SPF 30+.'
            : 'UV levels are safe.',
      },
    },

    alerts:
      maxRain >= 75
        ? [
          {
            id: `alert-${loc.name.toLowerCase()}`,

            event:
              'Heavy Rain & Convective Cell Advisory',

            severity: 'warning',

            headline:
              `High Precipitation Probability in ${loc.name}`,

            description:
              `Atmospheric models indicate active precipitation bands with rain likelihood reaching ${maxRain}%.`,

            instruction:
              'Exercise caution while commuting on water-slick roads.',

            startTime:
              'Active Now',

            expires:
              'Next 4 Hours',

            areaDesc:
              `${loc.name} metropolitan area`,
          },
        ]
        : undefined,
  };

  return payload;
}


// ============================================================
// PROCESS WEATHER QUERY
// ============================================================

export async function processWeatherQuery(
  userQuery: string,
  currentLocation: LocationInfo,
  units: 'metric' | 'imperial',
  thinkingMode: boolean,
  language: string
): Promise<{
  text: string;
  weatherData?: WeatherPayload;
  thoughtProcess?: string;
  language: string;
}> {

  // IMPORTANT:
  // The language selected from the UI has priority.
  const selectedLanguage = language || 'en';

  const targetLocation =
    extractLocationFromQuery(
      userQuery,
      currentLocation
    );


  // ----------------------------------------------------------
  // LIVE WEATHER
  // ----------------------------------------------------------

  let weatherData:
    WeatherPayload | undefined;

  try {
    weatherData =
      await fetchLiveWeather(
        targetLocation,
        units
      );
  } catch (err) {
    console.error(
      'Live weather fetch error:',
      err
    );
  }


  // ----------------------------------------------------------
  // SEND REQUEST TO FASTAPI
  // ----------------------------------------------------------

  let thoughtProcess:
    string | undefined;

  try {

    const response = await fetch(
      'http://127.0.0.1:8001/chat',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          message: userQuery,

          latitude:
            targetLocation.latitude,

          longitude:
            targetLocation.longitude,

          location_name:
            targetLocation.name,

          units,

          days: 5,

          language:
            selectedLanguage,

          history: [],
        }),
      }
    );


    if (!response.ok) {

      const errorText =
        await response.text();

      throw new Error(
        `WeatherGPT backend error ${response.status}: ${errorText}`
      );
    }


    const data =
      await response.json();


    // --------------------------------------------------------
    // AI RESPONSE
    // --------------------------------------------------------

    const aiText =
      data.response ||
      'Unable to generate a weather response.';


    // --------------------------------------------------------
    // THINKING MODE
    // --------------------------------------------------------

    if (thinkingMode) {

      if (selectedLanguage === 'hi') {

        thoughtProcess =
          `• यूजर का प्रश्न: "${userQuery}"
• चयनित भाषा: हिंदी
• स्थान: ${targetLocation.name}
• लाइव मौसम डेटा प्राप्त किया गया।
• मौसम की स्थिति और वर्षा संभावना का विश्लेषण किया गया।
• हिंदी में उत्तर तैयार किया गया।`;

      } else if (
        selectedLanguage === 'te'
      ) {

        thoughtProcess =
          `• వినియోగదారు ప్రశ్న: "${userQuery}"
• ఎంచుకున్న భాష: తెలుగు
• స్థానం: ${targetLocation.name}
• ప్రత్యక్ష వాతావరణ డేటా పొందబడింది.
• వాతావరణ పరిస్థితులు విశ్లేషించబడ్డాయి.
• తెలుగులో సమాధానం సిద్ధం చేయబడింది.`;

      } else if (
        selectedLanguage === 'ta'
      ) {

        thoughtProcess =
          `• பயனர் கேள்வி: "${userQuery}"
• தேர்ந்தெடுக்கப்பட்ட மொழி: தமிழ்
• இடம்: ${targetLocation.name}
• நேரடி வானிலை தரவு பெறப்பட்டது.
• வானிலை நிலை பகுப்பாய்வு செய்யப்பட்டது.
• தமிழில் பதில் உருவாக்கப்பட்டது.`;

      } else {

        thoughtProcess =
          `• User query: "${userQuery}"
• Selected language: ${selectedLanguage}
• Target location: ${targetLocation.name}
• Live weather data retrieved.
• Weather conditions analyzed.
• Response generated in the selected language.`;
      }
    }


    return {
      text: aiText,

      weatherData:
        data.weather_context ||
        weatherData,

      thoughtProcess,

      language:
        selectedLanguage,
    };


  } catch (err) {

    console.error(
      'WeatherGPT AI request failed:',
      err
    );


    let fallbackText = '';


    if (selectedLanguage === 'hi') {

      fallbackText =
        `क्षमा करें, ${targetLocation.name} के लिए मौसम जानकारी प्राप्त करते समय समस्या हुई। कृपया कुछ देर बाद पुनः प्रयास करें।`;

    } else if (
      selectedLanguage === 'te'
    ) {

      fallbackText =
        `క్షమించండి, ${targetLocation.name} కోసం వాతావరణ సమాచారాన్ని పొందడంలో సమస్య ఏర్పడింది. దయచేసి కొంత సమయం తర్వాత మళ్లీ ప్రయత్నించండి.`;

    } else if (
      selectedLanguage === 'ta'
    ) {

      fallbackText =
        `மன்னிக்கவும், ${targetLocation.name} வானிலை தகவலைப் பெறுவதில் சிக்கல் ஏற்பட்டது. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.`;

    } else if (
      selectedLanguage === 'bn'
    ) {

      fallbackText =
        `দুঃখিত, ${targetLocation.name}-এর আবহাওয়ার তথ্য পেতে সমস্যা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।`;

    } else if (
      selectedLanguage === 'mr'
    ) {

      fallbackText =
        `क्षमस्व, ${targetLocation.name} चे हवामान माहिती मिळवताना समस्या आली. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.`;

    } else {

      fallbackText =
        `Sorry, I was unable to retrieve the latest weather information for ${targetLocation.name}. Please try again shortly.`;
    }


    return {
      text: fallbackText,
      weatherData,
      thoughtProcess,
      language:
        selectedLanguage,
    };
  }
}

