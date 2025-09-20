import { Link, useLocation } from 'react-router-dom';
import { Home, Users, FileText, BarChart3, Briefcase, Trello } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      path: '/jobs',
      label: 'Jobs',
      icon: Briefcase,
      description: 'Manage job postings'
    },
    {
      path: '/assessments',
      label: 'Assessments',
      icon: FileText,
      description: 'Build job assessments'
    },
    {
      path: '/candidates',
      label: 'Candidates',
      icon: Users,
      description: 'Manage applications'
    },
    {
      path: '/pipeline',
      label: 'Pipeline',
      icon: Trello,
      description: 'Kanban board'
    },
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Analytics & reports'
    }
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/jobs" className="text-xl font-bold text-gray-900">
              TalentFlow
            </Link>
            
            <div className="flex items-center space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    title={item.description}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
