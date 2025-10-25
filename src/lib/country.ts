export interface CountryData {
  country: string;
  countryCode: string;
}

export const getCountry = async (): Promise<CountryData> => {
  try {
    const response = await fetch('http://ip-api.com/json');
    const data = await response.json();
    console.log(data)
    return {
      country: data.country || 'Unknown',
      countryCode: data.countryCode || 'XX'
    };
  } catch (error) {
    console.error('Error fetching country:', error);
    return {
      country: 'Unknown',
      countryCode: 'XX'
    };
  }
};

export const getCountryFlag = (countryCode: string): string => {
  if (countryCode === 'XX' || !countryCode) return '🌍';
  
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
};
