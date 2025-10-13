import React from 'react';
import { typeTranslations } from '../traduction/objet';

const ItemFilters = ({ filters, toggleFilter, itemTypes }) => (
    <div className="flex items-center space-x-4">
        <span className="text-gray-300 font-medium">Filtrer par type :</span>
        {itemTypes.map(type => (
            <label key={type} className="flex items-center space-x-2 cursor-pointer group">
                <div className="relative">
                    <input
                        type="checkbox"
                        checked={filters[type]}
                        onChange={() => toggleFilter(type)}
                        className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                        filters[type]
                            ? 'bg-gradient-to-r from-orange-400 to-red-500 border-orange-400 shadow-lg'
                            : 'border-gray-600 bg-gray-800 group-hover:border-orange-400/50'
                    }`}>
                        {filters[type] && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                        )}
                    </div>
                </div>
                <span className={`text-sm transition-colors duration-200 group-hover:text-orange-400 ${
                    filters[type] ? 'text-white font-medium' : 'text-gray-400'
                }`}>
          {typeTranslations[type]}
        </span>
            </label>
        ))}
    </div>
);

export default ItemFilters;
