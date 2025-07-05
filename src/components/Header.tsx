import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  
  const handleLogoClick = () => {
    // Navigate to admin dashboard
    navigate('/admin');
  };
  
  return (
    <header className="mb-6 sm:mb-8 animate-fadeInDown animation-delay-200">
      <img 
        src="https://i.imgur.com/QJxTIcN.png" 
        alt="Blue Drops Logo"
        className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleLogoClick}
        title="Clique para acessar o painel administrativo"
      />
    </header>
  );
};