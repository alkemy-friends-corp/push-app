export const COUNTRIES = [
  { value: 'us', label: 'United States', flag: '🇺🇸' },
  { value: 'uk', label: 'United Kingdom', flag: '🇬🇧' },
  { value: 'kr', label: 'South Korea', flag: '🇰🇷' },
  { value: 'cn', label: 'China', flag: '🇨🇳' },
  { value: 'tw', label: 'Taiwan', flag: '🇹🇼' },
  { value: 'hk', label: 'Hong Kong', flag: '🇭🇰' },
  { value: 'sg', label: 'Singapore', flag: '🇸🇬' },
  { value: 'my', label: 'Malaysia', flag: '🇲🇾' },
  { value: 'th', label: 'Thailand', flag: '🇹🇭' },
  { value: 'ph', label: 'Philippines', flag: '🇵🇭' },
  { value: 'in', label: 'India', flag: '🇮🇳' },
  { value: 'au', label: 'Australia', flag: '🇦🇺' },
  { value: 'ca', label: 'Canada', flag: '🇨🇦' },
  { value: 'fr', label: 'France', flag: '🇫🇷' },
  { value: 'de', label: 'Germany', flag: '🇩🇪' },
  { value: 'it', label: 'Italy', flag: '🇮🇹' },
  { value: 'es', label: 'Spain', flag: '🇪🇸' },
  { value: 'br', label: 'Brazil', flag: '🇧🇷' },
  { value: 'mx', label: 'Mexico', flag: '🇲🇽' },
  { value: 'other', label: 'Other', flag: '🌍' }
];

export const getStayDurations = (t: (key: string) => string) => [
  { value: '1', label: t('duration.1day') },
  { value: '2', label: t('duration.2days') },
  { value: '3', label: t('duration.3days') },
  { value: '4', label: t('duration.4days') },
  { value: '5', label: t('duration.5days') },
  { value: '7', label: t('duration.1week') },
  { value: '14', label: t('duration.2weeks') },
  { value: '21', label: t('duration.3weeks') },
  { value: '28', label: t('duration.4weeks') }
];