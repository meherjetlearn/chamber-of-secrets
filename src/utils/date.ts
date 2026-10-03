// Date, Lunar Phase, and Hogwarts Astronomical Hour generator

export function getMoonPhase(date: Date = new Date()): { name: string; symbol: string } {
  // Approximate lunar cycle calculation
  const lp = 2551443;
  const now = date.getTime();
  const newMoonRef = new Date(1970, 0, 7, 20, 35, 0).getTime();
  const phase = ((now - newMoonRef) / 1000) % lp;
  const phaseDays = phase / (24 * 3600);

  if (phaseDays < 1.84566) return { name: 'New Moon', symbol: '🌑' };
  if (phaseDays < 5.53699) return { name: 'Waxing Crescent', symbol: '🌒' };
  if (phaseDays < 9.22831) return { name: 'First Quarter', symbol: '🌓' };
  if (phaseDays < 12.91963) return { name: 'Waxing Gibbous', symbol: '🌔' };
  if (phaseDays < 16.61096) return { name: 'Full Moon', symbol: '🌕' };
  if (phaseDays < 20.30228) return { name: 'Waning Gibbous', symbol: '🌖' };
  if (phaseDays < 23.99361) return { name: 'Last Quarter', symbol: '🌗' };
  if (phaseDays < 27.68493) return { name: 'Waning Crescent', symbol: '🌘' };
  return { name: 'New Moon', symbol: '🌑' };
}

export function getHogwartsHour(date: Date = new Date()): string {
  const hours = date.getHours();
  if (hours >= 0 && hours < 3) return 'Midnight Watch • The Restricted Section';
  if (hours >= 3 && hours < 6) return 'The Witching Hour • Astronomy Tower Vigil';
  if (hours >= 6 && hours < 9) return 'Dawn Mist • The Great Lake Awakening';
  if (hours >= 9 && hours < 12) return 'Morning Cantrip • Transfiguration Cloister';
  if (hours >= 12 && hours < 15) return 'Sun zenith • The Herbology Greenhouses';
  if (hours >= 15 && hours < 18) return 'Afternoon Glow • Quidditch Pitch Shadows';
  if (hours >= 18 && hours < 21) return 'Dusk Feast • Great Hall Candlelight';
  return 'Nightfall Whisper • Common Room Embers';
}

export function formatParchmentDate(date: Date = new Date()): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayName = days[date.getDay()];
  const dayNum = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return `${dayName}, the ${getOrdinal(dayNum)} of ${monthName}, ${year}`;
}
