import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Upload, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCurrency } from '../contexts/CurrencyContext';
import { useBudget } from '../contexts/BudgetContext';

const BudgetTemplates = () => {
  const { currencySymbol, convertToINR, convertFromINR } = useCurrency();
  const { updateBudget } = useBudget();
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Pre-defined templates (amounts in INR)
  const templates = [
    {
      id: 'student',
      name: 'Student Budget',
      description: 'Perfect for students with limited income',
      icon: '🎓',
      totalBudget: 10000,
      categories: {
        Food: 3000,
        Transportation: 1500,
        Entertainment: 2000,
        Books: 1500,
        Other: 2000,
      },
      color: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
    },
    {
      id: 'professional',
      name: 'Professional Budget',
      description: 'For working professionals',
      icon: '💼',
      totalBudget: 30000,
      categories: {
        Food: 8000,
        Transportation: 5000,
        Entertainment: 5000,
        Shopping: 5000,
        Utilities: 4000,
        Other: 3000,
      },
      color: 'from-green-500/20 to-green-500/5 border-green-500/30',
    },
    {
      id: 'family',
      name: 'Family Budget',
      description: 'For families with kids',
      icon: '👨‍👩‍👧‍👦',
      totalBudget: 50000,
      categories: {
        Food: 15000,
        Transportation: 8000,
        Utilities: 10000,
        Education: 7000,
        Healthcare: 5000,
        Entertainment: 3000,
        Other: 2000,
      },
      color: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
    },
    {
      id: 'minimal',
      name: 'Minimal Budget',
      description: 'Focus on essentials only',
      icon: '🎯',
      totalBudget: 15000,
      categories: {
        Food: 5000,
        Transportation: 3000,
        Utilities: 4000,
        Healthcare: 2000,
        Other: 1000,
      },
      color: 'from-gray-500/20 to-gray-500/5 border-gray-500/30',
    },
    {
      id: 'luxury',
      name: 'Luxury Budget',
      description: 'For higher income earners',
      icon: '💎',
      totalBudget: 100000,
      categories: {
        Food: 20000,
        Transportation: 15000,
        Entertainment: 20000,
        Shopping: 15000,
        Travel: 15000,
        Utilities: 8000,
        Other: 7000,
      },
      color: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30',
    },
    {
      id: 'saving',
      name: 'Aggressive Saving',
      description: 'Maximize savings potential',
      icon: '🐷',
      totalBudget: 20000,
      categories: {
        Food: 6000,
        Transportation: 3000,
        Utilities: 4000,
        Entertainment: 2000,
        Healthcare: 3000,
        Other: 2000,
      },
      color: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
    },
  ];

  const applyTemplate = (template) => {
    try {
      // Apply total budget
      updateBudget(template.totalBudget);
      
      // Apply category budgets
      localStorage.setItem('category-budgets', JSON.stringify(template.categories));
      
      toast.success(`${template.name} applied successfully!`, {
        icon: template.icon,
      });
      
      setSelectedTemplate(template.id);
      
      // Suggest page refresh
      setTimeout(() => {
        if (window.confirm('Template applied! Refresh the page to see changes?')) {
          window.location.reload();
        }
      }, 1000);
    } catch (error) {
      toast.error('Failed to apply template');
    }
  };

  const exportCurrentBudget = () => {
    const currentBudget = {
      name: 'My Custom Budget',
      totalBudget: parseFloat(localStorage.getItem('monthly-budget') || '0'),
      categories: JSON.parse(localStorage.getItem('category-budgets') || '{}'),
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(currentBudget, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `budget-template-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Budget exported!', {
      icon: '📥',
    });
  };

  const importBudget = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        
        if (imported.totalBudget) {
          updateBudget(imported.totalBudget);
        }
        
        if (imported.categories) {
          localStorage.setItem('category-budgets', JSON.stringify(imported.categories));
        }
        
        toast.success('Budget imported successfully!');
        
        setTimeout(() => {
          if (window.confirm('Budget imported! Refresh to see changes?')) {
            window.location.reload();
          }
        }, 1000);
      } catch (error) {
        toast.error('Invalid budget file');
      }
    };
    
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <FileText className="w-6 h-6 mr-2 text-blue-400" />
              Budget Templates
            </h2>
            <p className="text-gray-400 mt-1">Quick setup with pre-configured budgets</p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={exportCurrentBudget}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            
            <label className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importBudget}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <FileText className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-semibold text-white mb-1">How to use templates:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Click "Apply" on any template to use it instantly</li>
              <li>Templates will set both overall and category budgets</li>
              <li>Export your current budget to save as a custom template</li>
              <li>Import previously exported templates</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <motion.div
            key={template.id}
            whileHover={{ scale: 1.03 }}
            className={`bg-gradient-to-br ${template.color} border rounded-xl p-6 cursor-pointer`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-4xl">{template.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{template.description}</p>
                </div>
              </div>
              {selectedTemplate === template.id && (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
            </div>

            {/* Total Budget */}
            <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-400 mb-1">Total Monthly Budget</p>
              <p className="text-2xl font-bold text-white">
                {currencySymbol}{convertFromINR(template.totalBudget).toFixed(2)}
              </p>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-2 mb-4">
              <p className="text-sm font-semibold text-white">Category Breakdown:</p>
              <div className="space-y-1">
                {Object.entries(template.categories).map(([category, amount]) => (
                  <div key={category} className="flex justify-between text-sm">
                    <span className="text-gray-300">{category}</span>
                    <span className="text-white font-semibold">
                      {currencySymbol}{convertFromINR(amount).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={() => applyTemplate(template)}
              className="w-full flex items-center justify-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4 mr-2" />
              Apply Template
            </button>
          </motion.div>
        ))}
      </div>

      {/* Custom Template Info */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Create Custom Templates</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <p>
            <strong className="text-white">1. Set your budget:</strong> Configure your monthly and category budgets
          </p>
          <p>
            <strong className="text-white">2. Export:</strong> Click the "Export" button to save your configuration
          </p>
          <p>
            <strong className="text-white">3. Share:</strong> Share the JSON file with others or keep as backup
          </p>
          <p>
            <strong className="text-white">4. Import:</strong> Use "Import" to load previously saved templates
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default BudgetTemplates;