import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  Leaf,
  Menu,
  X
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <button className="mobile-menu-toggle" onClick={toggleSidebar}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <Leaf size={28} />
          <span>NutriSystem</span>
        </div>
        
        <nav className="sidebar-nav">
          <Link 
            to="/dashboard" 
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link 
            to="/pacientes" 
            className={`nav-item ${isActive('/pacientes') ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <Users size={20} />
            Pacientes
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleSignOut} className="logout-button">
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
};
