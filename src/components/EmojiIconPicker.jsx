import React, { useState } from "react";
import * as LucideIcons from "lucide-react";
import { emojiSet, lucideSet } from "../data/emoji.js";
import { getArmorIcons } from "../data/icons.js";

const EmojiIconPicker = ({ isOpen, onClose, onSelect, cardColor, borderColor }) => {
    const [activeTab, setActiveTab] = useState('armor');
    const armorIcons = getArmorIcons();

    if (!isOpen) return null;

    const tabs = [
        { id: 'armor', label: 'Armure', icon: '🛡️' },
        { id: 'object', label: 'Objet', icon: '⚔️' },
        { id: 'other', label: 'Autre', icon: '📱' },
    ];

    // Style dynamique pour les boutons d'icônes basé sur la rareté
    const buttonStyle = cardColor 
        ? `bg-gradient-to-br ${cardColor} border-2 ${borderColor || 'border-transparent'}`
        : "bg-gray-800/50 border-2 border-transparent hover:border-orange-400";

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl p-8 w-[700px] max-h-[80vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <span className="text-4xl">🎨</span>
                        <h3 className="text-white text-2xl font-bold">Choisir une icône</h3>
                    </div>
                    
                    <div className="flex bg-gray-950/50 p-1 rounded-lg border border-gray-700">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${
                                    activeTab === tab.id
                                        ? 'bg-orange-500 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-y-auto scrollbar-custom flex-1 p-2 min-h-[300px]">
                    {activeTab === 'armor' && (
                        <div>
                            <h4 className="text-orange-400 text-lg font-semibold mb-3 sticky top-0 bg-gray-900/90 backdrop-blur py-2 z-10">
                                🛡️ Armures & Équipements
                            </h4>
                            <div className="grid grid-cols-8 gap-3">
                                {armorIcons.map((icon) => (
                                    <button
                                        key={icon.id}
                                        onClick={() => {
                                            // On envoie le nom du fichier (ex: "Arm-1.svg") au lieu de l'URL complète
                                            onSelect(icon.name);
                                            onClose();
                                        }}
                                        className={`flex items-center justify-center h-16 w-16 rounded-xl transition-all hover:scale-110 p-2 group ${buttonStyle}`}
                                    >
                                        <img 
                                            src={icon.url} 
                                            alt={icon.name}
                                            className="w-full h-full object-contain filter drop-shadow-lg" 
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'object' && (
                        <div>
                            <h4 className="text-orange-400 text-lg font-semibold mb-3 sticky top-0 bg-gray-900/90 backdrop-blur py-2 z-10">
                                ✨ Objets & Symboles
                            </h4>
                            <div className="grid grid-cols-10 gap-2">
                                {[...lucideSet].map((iconName, i) => {
                                    const IconComponent = LucideIcons[iconName];
                                    if (!IconComponent) return null;
                                    return (
                                        <button
                                            key={`lucide-${i}`}
                                            onClick={() => {
                                                onSelect(iconName);
                                                onClose();
                                            }}
                                            className={`flex items-center justify-center h-14 w-14 rounded-lg transition-all hover:scale-110 ${buttonStyle}`}
                                            title={iconName}
                                        >
                                            <IconComponent size={24} className="text-white" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'other' && (
                        <div>
                            <h4 className="text-orange-400 text-lg font-semibold mb-3 sticky top-0 bg-gray-900/90 backdrop-blur py-2 z-10">
                                📱 Emojis & Divers
                            </h4>
                            <div className="grid grid-cols-10 gap-2">
                                {[...emojiSet].map((emoji, i) => (
                                    <button
                                        key={`emoji-${i}`}
                                        onClick={() => {
                                            onSelect(emoji);
                                            onClose();
                                        }}
                                        className={`flex items-center justify-center h-14 w-14 rounded-lg transition-all hover:scale-110 ${buttonStyle}`}
                                    >
                                        <span className="text-2xl">{emoji}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-6 pt-4 border-t border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 font-medium"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmojiIconPicker;