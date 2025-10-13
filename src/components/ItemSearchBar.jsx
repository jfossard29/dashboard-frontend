import React from 'react';
import { Search } from 'lucide-react';

const ItemSearchBar = ({ searchTerm, onSearchChange }) => (
    <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
            type="text"
            placeholder="Rechercher un objet..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-white placeholder-gray-400 transition-all duration-200"
        />
    </div>
);

export default ItemSearchBar;
