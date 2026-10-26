import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Calendar, Tag, DollarSign, Search } from 'lucide-react';

const AdvancedFilters = ({ onFilterChange, type }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
  });

  const categories = type === 'expense' 
    ? ['All', 'Food', 'Transportation', 'Entertainment', 'Utilities', 'Other']
    : ['All', 'Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      search: '',
      category: 'All',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'All').length;

  return (
    <div className="bg-gray-800 rounded-xl p-4 shadow-lg mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
          {activeFiltersCount > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={clearFilters}
              className="flex items-center space-x-1 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Clear All</span>
            </motion.button>
          )}
        </div>

        {/* Quick Search */}
        <div className="relative flex-1 max-w-md ml-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
              {/* Category Filter */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                  <Tag className="w-4 h-4 mr-2" />
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Amount Min */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Min Amount
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={filters.amountMin}
                  onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Amount Max */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Max Amount
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={filters.amountMax}
                  onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400 mb-2">Active Filters:</p>
                <div className="flex flex-wrap gap-2">
                  {filters.search && (
                    <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full flex items-center">
                      Search: {filters.search}
                      <X 
                        className="w-3 h-3 ml-2 cursor-pointer" 
                        onClick={() => handleFilterChange('search', '')}
                      />
                    </span>
                  )}
                  {filters.category !== 'All' && (
                    <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full flex items-center">
                      {filters.category}
                      <X 
                        className="w-3 h-3 ml-2 cursor-pointer" 
                        onClick={() => handleFilterChange('category', 'All')}
                      />
                    </span>
                  )}
                  {filters.dateFrom && (
                    <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full flex items-center">
                      From: {filters.dateFrom}
                      <X 
                        className="w-3 h-3 ml-2 cursor-pointer" 
                        onClick={() => handleFilterChange('dateFrom', '')}
                      />
                    </span>
                  )}
                  {filters.dateTo && (
                    <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full flex items-center">
                      To: {filters.dateTo}
                      <X 
                        className="w-3 h-3 ml-2 cursor-pointer" 
                        onClick={() => handleFilterChange('dateTo', '')}
                      />
                    </span>
                  )}
                  {filters.amountMin && (
                    <span className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-full flex items-center">
                      Min: ${filters.amountMin}
                      <X 
                        className="w-3 h-3 ml-2 cursor-pointer" 
                        onClick={() => handleFilterChange('amountMin', '')}
                      />
                    </span>
                  )}
                  {filters.amountMax && (
                    <span className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-full flex items-center">
                      Max: ${filters.amountMax}
                      <X 
                        className="w-3 h-3 ml-2 cursor-pointer" 
                        onClick={() => handleFilterChange('amountMax', '')}
                      />
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedFilters;