import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Admin = () => {
  const [userStats, setUserStats] = useState([]);
  const [overallStats, setOverallStats] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userStatsResponse, overallStatsResponse] = await Promise.all([
        axios.get(`${API_URL}/api/admin/user-stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`${API_URL}/api/admin/overall-stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);
      setUserStats(userStatsResponse.data);
      setOverallStats(overallStatsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`${API_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUserStats(userStats.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  
  const filteredUsers = userStats.filter(user => 
    (user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filter === 'all' || 
     (filter === 'positive' && user.balance > 0) ||
     (filter === 'negative' && user.balance < 0))
  );

  
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const monthlyStatsChart = overallStats.monthlyStats?.map(stat => ({
    name: monthNames[stat.month - 1],
    Income: stat.income,
    Expenses: stat.expense
  })) || [];

  const userBalanceData = userStats.map(user => ({
    name: user.username,
    balance: user.balance
  }));

  const expenseVsIncomeData = [
    { name: 'Total Expenses', value: overallStats.totalExpenses },
    { name: 'Total Income', value: overallStats.totalIncome }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 bg-gray-900 min-h-screen"
    >
      <h1 className="text-3xl font-bold mb-8 text-white">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-white">Monthly Income vs Expenses</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyStatsChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Income" fill="#82ca9d" />
              <Bar dataKey="Expenses" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-white">User Balances</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userBalanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="balance" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-white">Total Expenses vs Income</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseVsIncomeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {expenseVsIncomeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-white">Overall Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white">Total Users</h3>
              <p className="text-2xl font-bold text-blue-400">{overallStats.totalUsers}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white">Total Expenses</h3>
              <p className="text-2xl font-bold text-red-400">${overallStats.totalExpenses?.toFixed(2)}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white">Total Income</h3>
              <p className="text-2xl font-bold text-green-400">${overallStats.totalIncome?.toFixed(2)}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white">Net Balance</h3>
              <p className="text-2xl font-bold text-yellow-400">
                ${(overallStats.totalIncome - overallStats.totalExpenses)?.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-white">User Management</h2>
        <div className="mb-4 flex space-x-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-gray-700 text-white rounded-md"
          >
            <option value="all">All Users</option>
            <option value="positive">Positive Balance</option>
            <option value="negative">Negative Balance</option>
          </select>
        </div>
        <table className="w-full text-white">
          <thead>
            <tr>
              <th className="text-left p-2">Username</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Total Income</th>
              <th className="text-left p-2">Total Expenses</th>
              <th className="text-left p-2">Balance</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map(user => (
              <tr key={user._id} className="border-t border-gray-700">
                <td className="p-2">{user.username}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">${user.totalIncome.toFixed(2)}</td>
                <td className="p-2">${user.totalExpenses.toFixed(2)}</td>
                <td className="p-2">
                  <span className={user.balance >= 0 ? 'text-green-400' : 'text-red-400'}>
                    ${user.balance.toFixed(2)}
                  </span>
                </td>
                <td className="p-2">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md mr-2"
                  >
                    View
                  </button>
                  <button
                    onClick={() => deleteUser(user._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex justify-center">
          {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, i) => (
            <button
              key={i}
              onClick={() => paginate(i + 1)}
              className={`mx-1 px-3 py-1 rounded-md ${
                currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-white">User Details</h2>
            <p><strong>Username:</strong> {selectedUser.username}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
            <p><strong>Total Income:</strong> ${selectedUser.totalIncome.toFixed(2)}</p>
            <p><strong>Total Expenses:</strong> ${selectedUser.totalExpenses.toFixed(2)}</p>
            <p><strong>Balance:</strong> 
              <span className={selectedUser.balance >= 0 ? 'text-green-400' : 'text-red-400'}>
                ${selectedUser.balance.toFixed(2)}
              </span>
            </p>
            <button
              onClick={() => setSelectedUser(null)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Admin;