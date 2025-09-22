import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Briefcase, 
  Users, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Sparkles,
  TrendingUp,  // 📊 NEW: Analytics icon
  Kanban       // 📊 NEW: Pipeline icon
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Navbar = () => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/') {
      return true;
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      path: '/jobs',
      label: 'Jobs',
      icon: Briefcase,
      description: 'Manage Positions & Assessments',
      color: 'from-blue-500 to-blue-600'
    },
    {
      path: '/candidates',
      label: 'Candidates',
      icon: Users,
      description: 'View All Applications',
      color: 'from-green-500 to-green-600'
    },
    
    // 📊 NEW: Analytics Navigation Item
    {
      path: '/analytics',
      label: 'Analytics',
      icon: TrendingUp,
      description: 'Hiring Insights & Reports',
      color: 'from-orange-500 to-orange-600',
      
    }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-200">
                <Sparkles className="text-white" size={20} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  TalentFlow
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">Hiring Platform</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group relative flex items-center space-x-3 px-5 py-3 rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      active 
                        ? `bg-gradient-to-r ${item.color} shadow-sm` 
                        : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                    }`}>
                      <Icon 
                        size={18} 
                        className={active ? 'text-white' : 'text-gray-600 dark:text-gray-300'} 
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{item.label}</span>
            
                     
                    </div>

                    {/* Enhanced Tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      {item.description}
                      {item.badge && (
                        <span className="ml-2 px-1.5 py-0.5 bg-green-500 rounded text-xs font-bold">
                          {item.badge}
                        </span>
                      )}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative p-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 group"
              aria-label="Toggle theme"
            >
              <div className="relative w-5 h-5">
                <Sun 
                  size={20} 
                  className={`absolute inset-0 transform transition-all duration-300 ${
                    isDark ? 'rotate-90 scale-0' : 'rotate-0 scale-100'
                  }`} 
                />
                <Moon 
                  size={20} 
                  className={`absolute inset-0 transform transition-all duration-300 ${
                    isDark ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
                  }`} 
                />
              </div>
              
              {/* Theme toggle tooltip */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                Switch to {isDark ? 'Light' : 'Dark'} Mode
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
              </div>
            </button>

            {/* User Profile */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                <span className="text-white font-medium">A</span>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-4 px-4 py-4 rounded-xl transition-colors ${
                      active
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-l-4 border-blue-600 ml-2'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg ${
                      active 
                        ? `bg-gradient-to-r ${item.color}` 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Icon 
                        size={20} 
                        className={active ? 'text-white' : 'text-gray-600 dark:text-gray-300'} 
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium text-base">{item.label}</div>
                        {/* Mobile Badge */}
                        {item.badge && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
