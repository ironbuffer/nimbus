/**
 * Display helpers for WMO weather codes.
 * These are pure functions — no state, no DI — so they live as standalone
 * exports rather than a service. Imported anywhere a component needs to
 * convert a numeric weather_code into something human-facing.
 *
 * WMO codes reference: https://open-meteo.com/en/docs
 */

export function getWeatherEmoji(code: number): string {
  if (code === 0)  return '☀️';   // Clear sky
  if (code <= 2)   return '⛅';   // Mainly clear / partly cloudy
  if (code === 3)  return '☁️';   // Overcast
  if (code <= 48)  return '🌫️';   // Fog
  if (code <= 55)  return '🌦️';   // Drizzle
  if (code <= 65)  return '🌧️';   // Rain
  if (code <= 75)  return '🌨️';   // Snow fall
  if (code <= 82)  return '🌧️';   // Rain showers
  if (code <= 86)  return '🌨️';   // Snow showers
  return '⛈️';                    // Thunderstorm
}

export function getWeatherDescription(code: number): string {
  if (code === 0)  return 'Clear sky';
  if (code <= 2)   return 'Partly cloudy';
  if (code === 3)  return 'Overcast';
  if (code <= 48)  return 'Foggy';
  if (code <= 55)  return 'Drizzle';
  if (code <= 65)  return 'Rainy';
  if (code <= 75)  return 'Snowy';
  if (code <= 82)  return 'Rain showers';
  if (code <= 86)  return 'Snow showers';
  return 'Thunderstorm';
}

/**
 * ISO date string + index → short weekday for forecast cards.
 * First entry in a daily forecast array is always today.
 */
export function getDayName(isoDate: string, index: number): string {
  if (index === 0) return 'Today';
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}
