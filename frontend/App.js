import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import CustomerLookup from './components/CustomerLookup';
import CustomerInput from './components/CustomerInput';

function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="bg-white shadow-md mb-6">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-blue-600">CATS</h1>
            <div className="flex space-x-4">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === '/'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Customer Lookup
              </Link>
              <Link
                to="/new-customer"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === '/new-customer'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                New Customer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<CustomerLookup />} />
          <Route path="/new-customer" element={<CustomerInput />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
