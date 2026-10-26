// frontend/src/components/Footer.jsx
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Finance Tracker</h3>
            <p className="text-gray-400 text-sm mb-4">
              AI-powered expense tracking and budgeting platform to help you manage your finances better.
            </p>
            <div className="flex space-x-3">
              <a href="https://www.facebook.com/share/1BSAm975Wh/" className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <Facebook className="w-5 h-5 text-gray-400 hover:text-white" />
              </a>
              <a href="https://x.com/harsh15960" className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <Twitter className="w-5 h-5 text-gray-400 hover:text-white" />
              </a>
              <a href="https://www.instagram.com/itz_singla_2005?igsh=NWRzNmdpODE5aG11" className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <Instagram className="w-5 h-5 text-gray-400 hover:text-white" />
              </a>
              <a href="https://www.linkedin.com/in/harsh08072005?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <Linkedin className="w-5 h-5 text-gray-400 hover:text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Features</h3>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm">AI Expense Insights</li>
              <li className="text-gray-400 text-sm">Budget Tracking</li>
              <li className="text-gray-400 text-sm">Multi-Currency Support</li>
              <li className="text-gray-400 text-sm">PDF/CSV Reports</li>
              <li className="text-gray-400 text-sm">Real-time Analytics</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <span className="text-gray-400 text-sm">harsh15960@gmail.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <span className="text-gray-400 text-sm">+91 8284915960</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  Chandigarh, India
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Finance Tracker. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm flex items-center mt-2 md:mt-0">
              Made with <Heart className="w-4 h-4 text-red-700 mx-1" /> in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;