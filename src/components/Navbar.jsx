import React from "react";
import { Users, BookOpen, Settings } from "lucide-react";

const Navbar = ({ currentPage, setCurrentPage }) => (
  <div className="fixed top-0 left-20 right-0 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700/50 p-4 flex items-center justify-between shadow-lg z-20">
    <div className="flex items-center space-x-4">
      <div className="flex space-x-2">
        <button
          onClick={() => setCurrentPage('forum')}
          className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
            currentPage === 'forum'
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          <Users size={18} />
          <span>Forum</span>
        </button>
        <button
          onClick={() => setCurrentPage('detail')}
          className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
            currentPage === 'detail'
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          <BookOpen size={18} />
          <span>Détails</span>
        </button>
        <button
          onClick={() => setCurrentPage('objets')}
          className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
            currentPage === 'objets'
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          <Users size={18} />
          <span>Objets</span>
        </button>
        <button
          onClick={() => setCurrentPage('configuration')}
          className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
            currentPage === 'configuration'
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          <Users size={18} />
          <span>Configuration</span>
        </button>
      </div>
    </div>
    
    <div className="flex items-center space-x-4">
      <div className="text-gray-400 text-sm">
        Bienvenue dans votre dashboard RPG
      </div>
      <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200">
        <Settings size={20} />
      </button>
    </div>
  </div>
);

export default Navbar;