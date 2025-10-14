import React from "react";
import {Users, BookOpen, Package, Settings, LogOut} from "lucide-react";

const Navbar = ({ currentPage, setCurrentPage, onLogout}) => (
    <div className="fixed top-0 left-20 right-0 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700/50 p-4 flex items-center justify-between shadow-lg z-20">
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
                {currentPage !== 'accueil' && (
                    <>
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
                            onClick={() => setCurrentPage('objets')}
                            className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                                currentPage === 'objets'
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                            }`}
                        >
                            <Package size={18} />
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
                            <Settings size={18} />
                            <span>Configuration</span>
                        </button>
                        <button
                            onClick={onLogout}
                            className="ml-auto px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 text-gray-400 hover:text-white hover:bg-red-500/50"
                        >
                            <LogOut size={18} />
                            <span>Déconnexion</span>
                        </button>

                    </>
                )}
            </div>
        </div>
    </div>
);

export default Navbar;