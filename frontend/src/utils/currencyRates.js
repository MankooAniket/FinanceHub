export const EXCHANGE_RATES = {
  INR: { symbol: '₹', rate: 1, name: 'Indian Rupee', code: 'INR' },
  USD: { symbol: '$', rate: 0.012, name: 'US Dollar', code: 'USD' },
  EUR: { symbol: '€', rate: 0.011, name: 'Euro', code: 'EUR' },
  GBP: { symbol: '£', rate: 0.0095, name: 'British Pound', code: 'GBP' },
  JPY: { symbol: '¥', rate: 1.79, name: 'Japanese Yen', code: 'JPY' },
  AUD: { symbol: 'A$', rate: 0.018, name: 'Australian Dollar', code: 'AUD' },
};

export const convertFromINR = (amountInINR, targetCurrency) => {
  const rate = EXCHANGE_RATES[targetCurrency]?.rate || 1;
  return amountInINR * rate;
};

export const convertToINR = (amount, sourceCurrency) => {
  const rate = EXCHANGE_RATES[sourceCurrency]?.rate || 1;
  return amount / rate;
};

export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  const amountInINR = convertToINR(amount, fromCurrency);
  return convertFromINR(amountInINR, toCurrency);
};

export const getCurrencySymbol = (currency) => {
  return EXCHANGE_RATES[currency]?.symbol || '₹';
};

export const getSupportedCurrencies = () => {
  return Object.keys(EXCHANGE_RATES);
};

