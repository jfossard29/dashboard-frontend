import React from "react";
import * as LucideIcons from "lucide-react";
import {emojiSet, lucideSet} from "../data/emoji.js";

const EmojiIconPicker = ({ isOpen, onClose, onSelect }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl p-8 w-[700px] max-h-[80vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center space-x-3 mb-6">
                    <span className="text-4xl">🎨</span>
                    <h3 className="text-white text-2xl font-bold">Choisir une icône</h3>
                </div>

                <div className="overflow-y-auto scrollbar-custom flex-1">
                    {/* Section Emojis */}
                    <div className="mb-6">
                        <h4 className="text-orange-400 text-lg font-semibold mb-3">📱 Emojis</h4>
                        <div className="grid grid-cols-10 gap-2">
                            {[...emojiSet].map((emoji, i) => (
                                <button
                                    key={`emoji-${i}`}
                                    onClick={() => {
                                        onSelect(emoji);
                                        onClose();
                                    }}
                                    className="flex items-center justify-center h-14 w-14 hover:bg-gradient-to-r hover:from-orange-500/30 hover:to-red-500/30 rounded-lg transition-all hover:scale-110 border-2 border-transparent hover:border-orange-400"
                                >
                                    <span className="text-2xl">{emoji}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Section Lucide Icons */}
                    <div>
                        <h4 className="text-orange-400 text-lg font-semibold mb-3">✨ Icônes Lucide</h4>
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
                                        className="flex items-center justify-center h-14 w-14 hover:bg-gradient-to-r hover:from-orange-500/30 hover:to-red-500/30 rounded-lg transition-all hover:scale-110 border-2 border-transparent hover:border-orange-400"
                                        title={iconName}
                                    >
                                        <IconComponent size={24} className="text-orange-400" />
                                    </button>
                                );
                            })}


                        </div>
                    </div>
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