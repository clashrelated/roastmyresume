import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Upload, Home, Info, Mail } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-gray-800 hover:text-gray-700 flex items-center">
              <FileText className="mr-2 h-6 w-6 text-purple-600" />
              Roast My Resume
            </Link>
            
            <nav className="flex space-x-2">
              <Link 
                to="/" 
                className="px-4 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 flex items-center"
              >
                <Home className="h-4 w-4 mr-1" />
                Home
              </Link>
              <Link 
                to="/upload" 
                className="px-4 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 flex items-center"
              >
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </Link>
              <Link 
                to="/about" 
                className="px-4 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 flex items-center"
              >
                <Info className="h-4 w-4 mr-1" />
                About
              </Link>
              <Link 
                to="/contact" 
                className="px-4 py-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 flex items-center"
              >
                <Mail className="h-4 w-4 mr-1" />
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} Roast My Resume. All rights reserved.
            </div>
            <div className="mt-4 md:mt-0 flex space-x-4 text-sm text-gray-500">
              <Link to="/about" className="hover:text-purple-600">About Us</Link>
              <span>|</span>
              <Link to="/contact" className="hover:text-purple-600">Contact</Link>
              <span>|</span>
              <span>A powerful AI-powered resume roaster</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;