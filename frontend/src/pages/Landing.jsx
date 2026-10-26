import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  PieChart, 
  Shield, 
  Smartphone, 
  Zap,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Target
} from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: <PieChart className="w-6 h-6" />,
      title: "Smart Analytics",
      description: "Visualize your spending with beautiful charts and insights"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Budget Goals",
      description: "Set and track budgets for different categories"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "AI Insights",
      description: "Get personalized financial advice from AI assistant"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "Your financial data is encrypted and protected"
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Multi-Currency",
      description: "Support for 6+ currencies including INR, USD, EUR"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Real-time Tracking",
      description: "Track expenses instantly with quick add features"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Finance Tracker</span>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                Take Control of
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {" "}Your Finances
                </span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
                Smart expense tracking with AI-powered insights. Track, analyze, and optimize your spending in one beautiful dashboard.
              </p>
              
              <div className="flex items-center justify-center gap-4">
                <Link
                  to="/signup"
                  className="group px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-lg font-semibold transition-all flex items-center gap-2"
                >
                  Start Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 border border-gray-700 hover:border-gray-600 text-white rounded-full text-lg font-semibold transition-colors"
                >
                  Sign In
                </Link>
              </div>

              <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Free forever</span>
                </div>
              </div>
            </motion.div>

            {/* Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-16"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl"></div>
                <div className="relative bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl">
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                      <div className="text-sm text-gray-400 mb-1">Total Income</div>
                      <div className="text-2xl font-bold text-green-400">₹80,600</div>
                    </div>
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                      <div className="text-sm text-gray-400 mb-1">Total Expenses</div>
                      <div className="text-2xl font-bold text-red-400">₹61,190</div>
                    </div>
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                      <div className="text-sm text-gray-400 mb-1">Balance</div>
                      <div className="text-2xl font-bold text-blue-400">₹19,410</div>
                    </div>
                  </div>
                  <div className="h-48 bg-gray-900 border border-gray-700 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-16 h-16 text-gray-600" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything you need to manage money
            </h2>
            <p className="text-xl text-gray-400">
              Powerful features to help you stay on top of your finances
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to take control?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of users who are already managing their finances smarter
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Wallet className="w-5 h-5 text-blue-400" />
              <span className="text-gray-400">© 2024 Finance Tracker. All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
              <a href="/contact" className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </a>
              <a href="/contact" className="text-gray-400 hover:text-white transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

