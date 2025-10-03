import React from 'react';

const Header: React.FC = () => {

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Placeholder for future navigation logic.
    // This prevents the default anchor behavior which can cause a page reload.
    console.log("Navigation link clicked. Implement routing.");
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h1 className="text-2xl font-bold text-gray-900">AI Government Bid Analyzer</h1>
            </div>
            <nav className="hidden sm:flex space-x-4">
                <a href="#" onClick={handleNavClick} className="text-gray-600 hover:text-indigo-600 font-medium px-3 py-2 rounded-md text-sm">Dashboard</a>
                <a href="#" onClick={handleNavClick} className="text-gray-600 hover:text-indigo-600 font-medium px-3 py-2 rounded-md text-sm">Uploads</a>
                <a href="#" onClick={handleNavClick} className="text-gray-600 hover:text-indigo-600 font-medium px-3 py-2 rounded-md text-sm">Settings</a>
            </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;