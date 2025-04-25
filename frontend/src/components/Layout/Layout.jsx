import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useTelegram } from '../../hooks/useTelegram';
import './Layout.css';

const Layout = ({ children }) => {
  const { telegram } = useTelegram();
  
  return (
    <div className="layout">
      <Header />
      <main className="layout__content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;