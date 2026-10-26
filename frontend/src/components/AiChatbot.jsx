import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useLocation } from 'react-router-dom';


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


const AIChatbot = () => {
  const location = useLocation();
  
  const hiddenPaths = ['/landing', '/login', '/signup', '/otp-verify', '/forgot-password', '/reset-password'];
  const shouldHide = hiddenPaths.includes(location.pathname);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! 👋 I can help with budgeting, saving, and app features. What would you like to know?',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post(
  `${API_URL}/api/ai/chat`,
  { message: userMessage }
);


      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.data.reply },
      ]);
    } catch (error) {
      console.error('AI Chat error:', error);

      const fallbackMessage = `I'm having trouble right now. 😔\n\nFor help:\n📧 harsh15960@gmail.com\n📞 +91 8284915960`;

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: fallbackMessage },
      ]);

      toast.error('Connection issue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (shouldHide) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg z-50"
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        <MessageCircle className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-80 h-96 bg-gray-800 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-700"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-white/20 rounded-full">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Finance Bot</h3>
                  <p className="text-xs text-white/80">Ask me anything</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-900">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex items-start space-x-1.5 max-w-[85%] ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div
                      className={`p-1 rounded-full flex-shrink-0 ${
                        message.role === 'user'
                          ? 'bg-blue-600'
                          : 'bg-purple-600'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="w-3 h-3 text-white" />
                      ) : (
                        <Bot className="w-3 h-3 text-white" />
                      )}
                    </div>
                    
                    <div
                      className={`px-3 py-2 rounded-lg text-sm leading-relaxed ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-gray-700 text-gray-100 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-xs">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-1.5">
                    <div className="p-1 rounded-full bg-purple-600">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-gray-700 px-3 py-2 rounded-lg rounded-tl-none">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-gray-800 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 px-3 py-1.5 text-sm bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;

