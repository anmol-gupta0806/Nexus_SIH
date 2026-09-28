import React from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AppRouter from './router';

export default function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <AppRouter />
      </main>
      <Footer />
    </div>
  );
}
