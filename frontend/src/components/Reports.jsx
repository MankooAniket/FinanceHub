import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Reports = ({ transactions, totalIncome, totalExpenses }) => {
  const [reportType, setReportType] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const generatePDFReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text('Financial Report', pageWidth / 2, 20, { align: 'center' });
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });
    
    // Report Period
    doc.setFontSize(12);
    doc.setTextColor(0);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    doc.text(`Period: ${monthNames[selectedMonth]} ${selectedYear}`, 14, 40);
    
    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text('Financial Summary', 14, 52);
    
    const filteredTransactions = getFilteredTransactions();
    const monthIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const monthExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const balance = monthIncome - monthExpenses;
    
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Total Income: $${monthIncome.toFixed(2)}`, 14, 62);
    doc.text(`Total Expenses: $${monthExpenses.toFixed(2)}`, 14, 70);
    doc.text(`Balance: $${balance.toFixed(2)}`, 14, 78);
    
    // Transactions Table
    doc.setFontSize(14);
    doc.setTextColor(41, 128, 185);
    doc.text('Transaction Details', 14, 92);
    
    const tableData = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.name,
      t.category,
      t.type === 'income' ? `+$${t.amount.toFixed(2)}` : `-$${t.amount.toFixed(2)}`,
      t.type.charAt(0).toUpperCase() + t.type.slice(1)
    ]);
    
    doc.autoTable({
      startY: 98,
      head: [['Date', 'Description', 'Category', 'Amount', 'Type']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 9 },
    });
    
    // Category Breakdown
    const categoryBreakdown = getCategoryBreakdown(filteredTransactions);
    if (categoryBreakdown.length > 0) {
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.setTextColor(41, 128, 185);
      doc.text('Expense Breakdown by Category', 14, finalY);
      
      const categoryData = categoryBreakdown.map(c => [
        c.category,
        `$${c.amount.toFixed(2)}`,
        `${c.percentage.toFixed(1)}%`
      ]);
      
      doc.autoTable({
        startY: finalY + 5,
        head: [['Category', 'Amount', 'Percentage']],
        body: categoryData,
        theme: 'striped',
        headStyles: { fillColor: [231, 76, 60] },
        styles: { fontSize: 9 },
      });
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    doc.save(`financial-report-${selectedMonth + 1}-${selectedYear}.pdf`);
    toast.success('PDF report generated successfully!');
  };

  const generateCSVReport = () => {
    const filteredTransactions = getFilteredTransactions();
    
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Type', 'Referral'];
    const csvData = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.name,
      t.category,
      t.amount.toFixed(2),
      t.type,
      t.referral || ''
    ]);
    
    // Add summary at the top
    const monthIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const monthExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const summaryRows = [
      ['Financial Report'],
      [`Period: ${new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`],
      [''],
      ['Summary'],
      ['Total Income', monthIncome.toFixed(2)],
      ['Total Expenses', monthExpenses.toFixed(2)],
      ['Balance', (monthIncome - monthExpenses).toFixed(2)],
      [''],
      headers
    ];
    
    const csvContent = [
      ...summaryRows,
      ...csvData
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financial-report-${selectedMonth + 1}-${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV report generated successfully!');
  };

  const getFilteredTransactions = () => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      if (reportType === 'monthly') {
        return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
      } else {
        return date.getFullYear() === selectedYear;
      }
    });
  };

  const getCategoryBreakdown = (transactionsList) => {
    const expenses = transactionsList.filter(t => t.type === 'expense');
    const totalExpenses = expenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const categoryMap = {};
    expenses.forEach(t => {
      if (!categoryMap[t.category]) {
        categoryMap[t.category] = 0;
      }
      categoryMap[t.category] += parseFloat(t.amount);
    });
    
    return Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalExpenses) * 100
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const filteredTransactions = getFilteredTransactions();
  const monthIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const monthExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <FileText className="w-6 h-6 mr-2 text-blue-400" />
          Generate Reports
        </h2>
        
        {/* Report Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="monthly">Monthly Report</option>
              <option value="yearly">Yearly Report</option>
            </select>
          </div>
          
          {reportType === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generatePDFReport}
            className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Download PDF
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateCSVReport}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Download CSV
          </motion.button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-400" />
          Report Preview
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Income</span>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-400">
              ${monthIncome.toFixed(2)}
            </p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Expenses</span>
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">
              ${monthExpenses.toFixed(2)}
            </p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Balance</span>
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <p className={`text-2xl font-bold ${monthIncome - monthExpenses >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              ${(monthIncome - monthExpenses).toFixed(2)}
            </p>
          </div>
        </div>

        <p className="text-gray-400 text-sm">
          This report includes {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} from{' '}
          {reportType === 'monthly' 
            ? `${months[selectedMonth]} ${selectedYear}`
            : selectedYear
          }
        </p>
      </div>
    </motion.div>
  );
};

export default Reports;

