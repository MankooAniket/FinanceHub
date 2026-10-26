import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { TransactionProvider } from './contexts/TransactionContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { BudgetProvider } from './contexts/BudgetContext';
import { ThemeProvider } from './contexts/ThemeContext';

import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import OTPVerify from './pages/OTPverify';
import ForgotPassword from './pages/ForgotPassword';
import UserDashboard from './pages/UserDashboard';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <CurrencyProvider>
          <BudgetProvider>
            <TransactionProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#1F2937',
                    color: '#fff',
                    border: '1px solid #374151',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />

              <Routes>
                {/* ✅ Public Routes - Anyone can access */}
                <Route path="/" element={<Landing />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/otp-verify" element={<OTPVerify />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/contact" element={<Contact />} />

                {/* ✅ Protected Routes - Need token */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  }
                />

                {/* Catch all unknown routes → Landing page */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </TransactionProvider>
          </BudgetProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;