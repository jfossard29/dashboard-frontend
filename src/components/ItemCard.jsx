import React from 'react';
import { Sparkles } from 'lucide-react';
import * as LucideIcons from "lucide-react";
import { rarityTranslations } from '../traduction/objet';
import { rarityColors } from '../data/objet';

const ItemCard = ({ item, onSelect }) => {
    const colors = rarityColors[item.rarete];

    const renderIcon = (iconName) => {
        if (!iconName) return '📦';
        if (iconName.length <= 2) return iconName;
        const IconComponent = LucideIcons[iconName];
        return IconComponent ? <IconComponent size={24} className="text-white" /> : '📦';
    };

    return (
        <div
            onClick={() => onSelect(item)}
            className="relative group cursor-pointer transform hover:scale-105 transition-all hover:z-10"
        >
            <div className={`absolute -inset-2 bg-gradient-to-r ${colors.glow} rounded-xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none`}></div>
            <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl p-6 border-2 border-gray-600/30 group-hover:border-orange-500 transition-all">
                <div className="absolute top-2 right-2 z-10">
                    <Sparkles size={16} className="text-orange-400 animate-pulse" />
                </div>
                <div className="flex items-center gap-4 mb-3">
                    <div className={`w-16 h-16 bg-gradient-to-br ${colors.card} rounded-xl flex items-center justify-center shadow-lg text-2xl`}>
                        {renderIcon(item.icone)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className={`${colors.text} font-bold text-lg truncate`}>{item.nom}</h3>
                        <span className={`text-sm ${colors.text}`}>{rarityTranslations[item.rarete]}</span>
                    </div>
                </div>
                <p className="text-gray-400 text-sm line-clamp-3">{item.description}</p>
            </div>
        </div>
    );
};

export default ItemCard;
