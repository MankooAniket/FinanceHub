export const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#06B6D4',
  income: '#10B981',
  expense: '#EF4444',
};


export const CATEGORY_COLORS = {
  Food: '#FF6384',
  Transportation: '#36A2EB',
  Entertainment: '#FFCE56',
  Shopping: '#4BC0C0',
  Utilities: '#9966FF',
  Healthcare: '#FF9F40',
  Education: '#FF6384',
  Other: '#C9CBCF',
  Salary: '#10B981',
  Freelance: '#3B82F6',
  Business: '#F59E0B',
  Investment: '#8B5CF6',
  Gift: '#EC4899',
};

export const getCategoryColor = (category, index = 0) => {
  if (CATEGORY_COLORS[category]) {
    return CATEGORY_COLORS[category];
  }
  
  const fallbackColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
    '#9966FF', '#FF9F40', '#C9CBCF', '#FF6384'
  ];
  
  return fallbackColors[index % fallbackColors.length];
};

export const RECHARTS_CONFIG = {
  margin: { top: 5, right: 30, left: 20, bottom: 5 },
};


export const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#1F2937',
    border: 'none',
    borderRadius: '8px',
    color: '#F3F4F6',
  },
  labelStyle: {
    color: '#F3F4F6',
  },
};

export const GRID_STYLE = {
  stroke: '#374151',
  strokeDasharray: '3 3',
};

export const AXIS_STYLE = {
  stroke: '#9CA3AF',
  fontSize: 12,
};

export const LEGEND_CONFIG = {
  verticalAlign: 'bottom',
  height: 36,
  iconType: 'circle',
};

export const formatChartCurrency = (value) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  }
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }
  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value.toFixed(0)}`;
};

export const formatChartPercentage = (value) => {
  return `${value.toFixed(1)}%`;
};

export const getChartDimensions = (containerWidth) => {
  if (containerWidth < 640) {
    return { width: containerWidth - 40, height: 250 };
  }
  if (containerWidth < 1024) {
    return { width: containerWidth - 60, height: 300 };
  }
  return { width: containerWidth - 80, height: 350 };
};

