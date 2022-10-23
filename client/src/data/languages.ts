export const LANGUAGES = [
  {
    id: 'en',
    name: 'English',
  },
  {
    id: 'cn',
    name: 'Chinese',
  },
  {
    id: 'hi',
    name: 'Hindi',
  },
  {
    id: 'es',
    name: 'Spanish',
  },
  {
    id: 'fr',
    name: 'French',
  },
  {
    id: 'ar',
    name: 'Arabic',
  },
  {
    id: 'bn',
    name: 'Bengali',
  },
  {
    id: 'ru',
    name: 'Russian',
  },
  {
    id: 'pt',
    name: 'Portuguese',
  },
  {
    id: 'id',
    name: 'Indonesian',
  },
  {
    id: 'ur',
    name: 'Urdu',
  },
  {
    id: 'ja',
    name: 'Japanese',
  },
  {
    id: 'de',
    name: 'German',
  },
  {
    id: 'pa',
    name: 'Punjabi',
  },
  {
    id: 'te',
    name: 'Telugu',
  },
  {
    id: 'tr',
    name: 'Turkish',
  },
  {
    id: 'ko',
    name: 'Korean',
  },
  {
    id: 'mr',
    name: 'Marathi',
  },
  {
    id: 'ky',
    name: 'Kyrgyz',
  },
  {
    id: 'kz',
    name: 'Kazakh',
  },
  {
    id: 'uz',
    name: 'Uzbek',
  },
  {
    id: 'ka',
    name: 'Georgian',
  },
  {
    id: 'pl',
    name: 'Polish',
  },
  {
    id: 'lt',
    name: 'Lithuanian',
  },
  {
    id: 'lv',
    name: 'Latvian',
  },
  {
    id: 'be',
    name: 'Belarusian',
  },
  {
    id: 'uk',
    name: 'Ukrainian',
  },
].sort((a, b) => {
  if (a.id > b.id) return 1;
  if (a.id < b.id) return -1;
  return 0;
});
