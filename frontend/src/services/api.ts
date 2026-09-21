const API_BASE = "http://localhost:8000";

export async function sendMessageToBackend(
  message: string,
  location: { name: string; latitude: number; longitude: number },
  unit: "metric" | "imperial" = "metric",
  language: string = "hi",          // any BCP-47 code: hi, en, ta, te, bn, mr, gu, kn, ml, pa, or, etc.
  history: Array<{ role: string; content: string }> = []
) {
  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        location,
        unit,
        language,           // send the requested language to the backend
        history: history.slice(-6),  // last 6 messages
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Backend error: ${response.status}`);
    }

    const data = await response.json();
    return data; // { response: string, language: string, weather_context?: any }
  } catch (error) {
    console.error("Backend connection failed:", error);
    throw error;
  }
}
