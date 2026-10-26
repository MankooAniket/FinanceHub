export const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return '₹0';
  
  const num = parseFloat(amount);
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

export const formatNumber = (number) => {
  if (!number || isNaN(number)) return '0';
  
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(parseFloat(number));
};

export const formatPercentage = (value) => {
  if (!value || isNaN(value)) return '0%';
  return `${parseFloat(value).toFixed(1)}%`;
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};