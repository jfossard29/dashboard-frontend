import React from 'react';
import { ChevronDown } from 'lucide-react';

const ItemSorter = ({ sortBy, setSortBy, sortOptions }) => (
    <div className="flex items-center space-x-3">
        <span className="text-gray-300 font-medium">Trier par :</span>
        <div className="relative">
            <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-gray-700 text-white px-4 py-2 pr-8 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
            >
                {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
    </div>
);

export default ItemSorter;
