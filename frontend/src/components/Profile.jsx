import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, CreditCard, Edit2, Save, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import DeleteAccount from './DeleteAccount';   // ✅ Added

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Profile = () => {
  const [user, setUser] = useState({
    username: '',
    email: '',
    createdAt: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    email: ''
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/auth/profile`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setUser(response.data);
      setEditData({
        username: response.data.username,
        email: response.data.email
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      username: user.username,
      email: user.email
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.put(
        `${API_URL}/api/auth/profile`,
        editData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setUser(response.data);
      localStorage.setItem('username', response.data.username);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 max-w-4xl mx-auto"
    >
      <div className="bg-gray-800 rounded-xl p-8 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">My Profile</h2>

          {!isEditing ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEdit}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </motion.button>
          ) : (
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </motion.button>
            </div>
          )}
        </div>

        <div className="space-y-6">

          {/* Username */}
          <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
            <div className="p-3 bg-blue-600 rounded-full">
              <User className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Username
              </label>

              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={editData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-md border-transparent focus:border-blue-500 focus:ring-0"
                />
              ) : (
                <p className="text-lg font-semibold text-white">
                  {user.username}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
            <div className="p-3 bg-green-600 rounded-full">
              <Mail className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Email
              </label>

              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-md border-transparent focus:border-blue-500 focus:ring-0"
                />
              ) : (
                <p className="text-lg font-semibold text-white">
                  {user.email}
                </p>
              )}
            </div>
          </div>

          {/* Member Since */}
          <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
            <div className="p-3 bg-purple-600 rounded-full">
              <Calendar className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Member Since
              </label>
              <p className="text-lg font-semibold text-white">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Statistics */}
      <div className="bg-gray-800 rounded-xl p-8 shadow-lg">
        <h3 className="text-2xl font-bold text-white mb-4">
          Account Statistics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">Account Status</p>
            <p className="text-2xl font-bold text-green-400">Active</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">Security</p>
            <p className="text-2xl font-bold text-purple-400">Secured</p>
          </div>
        </div>
      </div>

      {/* ✅ Delete Account Section */}
      <div className="mt-8">
        <DeleteAccount />
      </div>

    </motion.div>
  );
};

export default Profile;