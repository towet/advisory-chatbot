import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, GraduationCap, BookOpen, Building2, Brain, Send, Menu, X, User, Lock, Mail, ArrowRight, Eye, EyeOff, BookPlus, Save, Globe } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import { getGeminiResponse } from './lib/gemini';
import { addKnowledgeEntry, getKnowledgeEntries, searchInternet } from './lib/knowledgeBase';
import heroImage from './assets/hero.jpg';
import heroTwo from './assets/hero2.jpg';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  category?: 'course' | 'university' | 'career' | 'general';
  isTyping?: boolean;
}

type AuthMode = 'none' | 'login' | 'signup';

function App() {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "Hello! I'm your tertiary education advisor. How can I help you today?", 
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('none');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    username: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setMessages([]);
    toast.success('Successfully logged out!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
      <Toaster position="top-center" />
      
      <nav className="bg-white/70 backdrop-blur-lg sticky top-0 z-40 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-violet-600" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-transparent bg-clip-text">
                Tertiary Advisory
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-violet-600 transition">Features</a>
              <a href="#about" className="text-gray-600 hover:text-violet-600 transition">About</a>
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setShowChat(true);
                  } else {
                    setAuthMode('login');
                  }
                }}
                className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white px-6 py-2 rounded-xl hover:opacity-90 transition duration-300 shadow-lg hover:shadow-xl"
              >
                Start Chat
              </button>
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">Welcome, {currentUser?.username}!</span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-violet-600 transition"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <button
                    onClick={() => setAuthMode('login')}
                    className="text-violet-600 hover:text-violet-700 font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setAuthMode('signup')}
                    className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white px-6 py-2 rounded-xl hover:opacity-90 transition duration-300"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white/90 backdrop-blur-lg border-t border-white/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-gray-600">Features</a>
              <a href="#about" className="block px-3 py-2 text-gray-600">About</a>
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setShowChat(true);
                  } else {
                    setAuthMode('login');
                  }
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-violet-600"
              >
                Start Chat
              </button>
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-gray-600"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-violet-600"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-violet-600"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8">
          {/* Text Content */}
          <div className="flex-1 space-y-6 text-center md:text-left w-full">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-transparent bg-clip-text">
                Your Personal
              </span>
              <br />
              Education Advisor
            </h1>
            <p className="text-gray-600 text-lg md:text-xl max-w-xl mx-auto md:mx-0">
              Get personalized guidance for your tertiary education journey. We help you make informed decisions about courses, universities, and career paths.
            </p>
            <div className="flex justify-center md:justify-start">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setShowChat(true);
                  } else {
                    setAuthMode('signup');
                  }
                }}
                className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:opacity-90 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full md:w-auto"
              >
                Start Chat
                <ArrowRight className="inline-block ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Image Container */}
          <div className="flex-1 relative w-full">
            <div className="relative w-full h-[450px] md:h-[500px] lg:h-[600px]">
              <img
                src={heroImage}
                alt="Students collaborating"
                className="w-full h-full object-cover rounded-2xl shadow-2xl transform hover:scale-[1.02] transition duration-500"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-600/20 via-transparent to-transparent"></div>
            </div>
            {/* Floating Stats */}
            <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg transform hover:-translate-y-1 transition duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="font-bold text-violet-600">98%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-transparent bg-clip-text">
            Why Choose Tertiary Advisory?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent mb-6">
                Start Your Journey Today
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Get expert advice on courses, careers, and educational opportunities with our advanced AI chatbot.
              </p>
              <a
                href="#chat"
                className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-gradient-to-r from-violet-600 to-blue-600 rounded-xl hover:from-violet-700 hover:to-blue-700 transition-all duration-200"
              >
                Start Chatting
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </div>
            <div className="relative">
              <img
                src={heroTwo}
                alt="Tertiary Advisory AI Chatbot"
                className="w-full h-auto rounded-3xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 to-transparent rounded-3xl"></div>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-transparent bg-clip-text">
            Why Choose Tertiary Advisory?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white/50 backdrop-blur-lg rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 border border-white/20">
              <BookOpen className="h-12 w-12 text-violet-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Course Guidance</h3>
              <p className="text-gray-600">Get personalized course recommendations based on your interests and career goals.</p>
            </div>
            <div className="p-8 bg-white/50 backdrop-blur-lg rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 border border-white/20">
              <Building2 className="h-12 w-12 text-violet-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Institution Insights</h3>
              <p className="text-gray-600">Learn about different universities and their unique offerings and opportunities.</p>
            </div>
            <div className="p-8 bg-white/50 backdrop-blur-lg rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 border border-white/20">
              <Brain className="h-12 w-12 text-violet-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Recommendations</h3>
              <p className="text-gray-600">Receive AI-powered suggestions tailored to your academic profile and aspirations.</p>
            </div>
          </div>
        </div>
      </div>

      {showChat && (
        <ChatInterface 
          messages={messages}
          setMessages={setMessages}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          currentUser={currentUser}
          onClose={() => setShowChat(false)}
        />
      )}
      {authMode !== 'none' && (
        <AuthModal 
          authMode={authMode} 
          setAuthMode={setAuthMode}
          setIsAuthenticated={setIsAuthenticated}
          setCurrentUser={setCurrentUser}
        />
      )}
    </div>
  );
}

const EnrichKnowledgeModal = ({
  isOpen,
  onClose,
  currentUser
}: {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { username: string } | null;
}) => {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<KnowledgeEntry['category']>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passKey, setPassKey] = useState('');
  const [isPassKeyValid, setIsPassKeyValid] = useState(false);

  const handlePassKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passKey === '2222') {
      setIsPassKeyValid(true);
    } else {
      toast.error('Invalid pass key');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await addKnowledgeEntry({
        topic: topic.trim(),
        content: content.trim(),
        category,
        created_by: currentUser?.username || 'anonymous'
      });

      toast.success('Knowledge base enriched successfully!');
      onClose();
      // Reset form
      setTopic('');
      setContent('');
      setCategory('general');
      setPassKey('');
      setIsPassKeyValid(false);
    } catch (error: any) {
      console.error('Error enriching knowledge base:', error);
      toast.error('Failed to enrich knowledge base. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Enrich Knowledge Base
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {!isPassKeyValid ? (
            // Pass Key Form
            <form onSubmit={handlePassKeySubmit} className="space-y-4">
              <div>
                <label htmlFor="passKey" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Pass Key
                </label>
                <input
                  type="password"
                  id="passKey"
                  value={passKey}
                  onChange={(e) => setPassKey(e.target.value)}
                  className="block w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter pass key to add knowledge"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Verify Pass Key
              </button>
            </form>
          ) : (
            // Knowledge Entry Form
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Topic field */}
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="block w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter topic"
                  required
                />
              </div>

              {/* Category field */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as KnowledgeEntry['category'])}
                  className="block w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="course">Course</option>
                  <option value="university">University</option>
                  <option value="career">Career</option>
                  <option value="general">General</option>
                </select>
              </div>

              {/* Content field */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="block w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter detailed information"
                  required
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </div>
                ) : (
                  'Add to Knowledge Base'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatInterface = ({ 
  messages, 
  setMessages, 
  isLoading, 
  setIsLoading,
  currentUser,
  onClose 
}: {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  currentUser: { username: string } | null;
  onClose: () => void;
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showEnrichModal, setShowEnrichModal] = useState(false);
  const [isInternetSearchEnabled, setIsInternetSearchEnabled] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      category: 'general'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setShowEmoji(false);

    try {
      // Get response from Gemini API
      const response = await getGeminiResponse(inputMessage);

      setMessages(prev => [...prev, {
        id: messages.length + 2,
        text: response,
        sender: 'ai',
        timestamp: new Date(),
        category: 'general'
      }]);

    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prev => [...prev, {
        id: messages.length + 2,
        text: "I apologize, but I'm having trouble responding right now. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
        category: 'general'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-md flex items-center justify-center p-0 md:p-6 z-50">
      <div className="w-full h-full md:h-[85vh] md:max-w-4xl bg-white/95 rounded-none md:rounded-3xl shadow-2xl border border-white/20 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm md:rounded-t-3xl">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 p-2.5 shadow-lg">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Tertiary Advisory</h2>
              <p className="text-sm text-gray-600">Your AI Education Guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
        >
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-end space-x-3 transform transition-all duration-300 hover:scale-[1.01]`}
              style={{ 
                animationDelay: `${index * 0.1}s`,
                opacity: 0,
                animation: 'fadeInUp 0.5s ease forwards'
              }}
            >
              {msg.sender === 'ai' && (
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 p-2.5 shadow-lg ring-4 ring-violet-50">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                </div>
              )}
              <div
                className={`group max-w-[85%] md:max-w-[70%] p-4 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-br from-violet-600 to-blue-600 text-white rounded-tr-none ml-4 shadow-blue-500/20'
                    : 'bg-white text-gray-800 rounded-tl-none shadow-lg mr-4'
                } shadow-xl hover:shadow-2xl transition-all duration-300`}
              >
                <p className="text-base leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                <div className={`text-xs mt-2 flex items-center justify-end space-x-2 ${
                  msg.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                }`}>
                  <span>{new Intl.DateTimeFormat('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                  }).format(msg.timestamp)}</span>
                  {msg.sender === 'user' && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-white/70"></div>
                      <span>You</span>
                    </div>
                  )}
                </div>
              </div>
              {msg.sender === 'user' && (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-100 to-blue-50 flex items-center justify-center shadow-md ring-4 ring-violet-50">
                  <User className="h-5 w-5 text-violet-600" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center space-x-3 animate-fade-in">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 p-2.5 shadow-lg ring-4 ring-violet-50">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-lg inline-block">
                <div className="flex space-x-2">
                  <div className="w-2.5 h-2.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-2.5 h-2.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2.5 h-2.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 md:p-6 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                ref={chatInputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="p-3 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          
          {/* Settings Bar */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <Globe className={`h-5 w-5 ${isInternetSearchEnabled ? 'text-blue-600' : 'text-gray-400'}`} />
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isInternetSearchEnabled}
                  onChange={(e) => setIsInternetSearchEnabled(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ms-3 text-sm font-medium text-gray-600">
                  Internet Search
                </span>
              </label>
            </div>
            <button
              onClick={() => setShowEnrichModal(true)}
              className="flex items-center space-x-2 bg-violet-50 px-3 py-1.5 rounded-xl hover:bg-violet-100 transition-colors duration-200"
            >
              <BookPlus className="h-5 w-5 text-violet-600" />
              <span className="text-sm text-violet-600 font-medium hidden md:inline">Enrich Knowledge</span>
            </button>
          </div>
        </div>
      </div>
      {showEnrichModal && (
        <EnrichKnowledgeModal
          isOpen={showEnrichModal}
          onClose={() => setShowEnrichModal(false)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

const AuthModal = ({ authMode, setAuthMode, setIsAuthenticated, setCurrentUser }: {
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  setIsAuthenticated: (value: boolean) => void;
  setCurrentUser: (user: { username: string } | null) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formState, setFormState] = useState({
    username: '',
    password: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Form submission handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.username || !formState.password) {
      toast.error('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsAuthenticated(true);
      setCurrentUser({
        username: formState.username
      });
      toast.success('Successfully logged in!');
      setAuthMode('none');
    } catch (error) {
      toast.error('Failed to log in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.username || !formState.password) {
      toast.error('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsAuthenticated(true);
      setCurrentUser({
        username: formState.username
      });
      toast.success('Account created successfully!');
      setAuthMode('none');
    } catch (error) {
      toast.error('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {authMode === 'login' ? 'Welcome back!' : 'Create account'}
            </h2>
            <button
              onClick={() => setAuthMode('none')}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            {/* Username field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formState.username}
                onChange={handleChange}
                className="block w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your username"
                required
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formState.password}
                  onChange={handleChange}
                  className="block w-full px-4 py-2 pr-10 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </div>
              ) : (
                authMode === 'login' ? 'Sign in' : 'Create account'
              )}
            </button>

            {/* Toggle auth mode */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {authMode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;