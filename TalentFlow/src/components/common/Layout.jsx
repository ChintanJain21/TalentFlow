import { useTheme } from "../../contexts/ThemeContext";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  const { isDark } = useTheme();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      
      {/* ✅ ENHANCED - Full background coverage */}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="container mx-auto px-6 py-8 min-h-screen">
          <div className="bg-gray-50 dark:bg-gray-900 transition-colors">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
