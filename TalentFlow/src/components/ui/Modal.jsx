import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Modal = ({ isOpen, onClose, title, children, size = 'md', showCloseButton = true }) => {
  const { isDark } = useTheme();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg', 
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl mx-4'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        
        {/* Strong Backdrop */}
        <div 
          className="fixed inset-0 bg-black/70 dark:bg-black/85 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
        
        {/* Modal with Maximum Contrast */}
        <div className={`
          relative w-full ${sizeClasses[size]} 
          transform transition-all duration-300 
          bg-white dark:bg-gray-900 
          rounded-2xl shadow-2xl 
          max-h-[90vh] overflow-hidden
          border-2 border-gray-400 dark:border-gray-500
        `}>
          
          {/* Header - Strong Contrast */}
          <div className="flex items-center justify-between p-6 border-b-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                {title}
              </h2>
            </div>
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="group p-2.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 border-2 border-gray-300 dark:border-gray-600"
                aria-label="Close modal"
              >
                <X size={22} className="transform group-hover:rotate-90 transition-transform duration-200" />
              </button>
            )}
          </div>
          
          {/* Content - Maximum Text Contrast */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="p-6 bg-white dark:bg-gray-900">
              <div className="text-gray-900 dark:text-gray-50">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
