import React, {useState} from 'react';
import { Plus, Save, X, Star, Flame } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { rarityTranslations, typeTranslations } from '../traduction/objet';
import { rarityColors } from '../data/objet';
import EmojiIconPicker from "./EmojiIconPicker.jsx";

const ItemEditorModal = ({
                             item,
                             onCancel,
                             onSave,
                             updateField,
                             addStat,
                             updateStat,
                             removeStat,
                             saving,
                             itemTypes = ['EQUIPEMENT', 'CONSOMMABLE', 'AUTRE'],
                             rarities = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']
                         }) => {
    if (!item) return null;
    const colors = rarityColors[item.rarete] || {
        glow: 'from-gray-600 to-gray-700',
        border: 'border-gray-600',
        text: 'text-gray-200',
        bg: 'from-gray-900 to-gray-800',
        card: 'from-gray-700 to-gray-800',
        borderFocus: 'border-gray-500'
    };
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

    const renderIcon = (iconName) => {
        if (!iconName) return '📦';
        if (iconName.length <= 2) return iconName;
        const IconComponent = LucideIcons[iconName];
        if (IconComponent) return <IconComponent size={24} className="text-white" />;
        return '📦';
    };

    const handleIconSelect = (selectedIcon) => {
        updateField('icone', selectedIcon);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-8">
            <div className="relative max-w-4xl w-full">
                <div className={`absolute -inset-4 bg-gradient-to-r ${colors.glow} rounded-3xl opacity-30 blur-3xl animate-pulse`}></div>

                <div className={`relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border-2 ${colors.border} shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto`}>
                    <div className="relative p-8 space-y-6">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700/50">
                            <div className="flex items-center gap-3">
                                <Flame className={`${colors.text} animate-pulse`} size={32} />
                                <h2 className={`text-3xl font-bold bg-gradient-to-r ${colors.glow} bg-clip-text text-transparent`}>
                                    MODIFICATION D'UN OBJET
                                </h2>
                            </div>
                            <button onClick={onCancel} className="text-gray-400 hover:text-white hover:rotate-90 transition-all">
                                <X size={28} />
                            </button>
                        </div>

                        {/* Rareté & Type */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className={`bg-gradient-to-br ${colors.bg} border-2 ${colors.border} rounded-xl p-4`}>
                                <label className={`block ${colors.text} text-xs font-bold mb-2 uppercase tracking-wider`}>Rareté</label>
                                <select
                                    value={item.rarete}
                                    onChange={(e) => updateField('rarete', e.target.value)}
                                    className={`w-full bg-gray-950/50 border-2 ${colors.borderFocus} rounded-lg px-4 py-2 text-white font-bold outline-none transition-all`}
                                >
                                    {rarities.map(r => (
                                        <option key={r} value={r}>{rarityTranslations[r]}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-2 border-blue-500/50 rounded-xl p-4">
                                <label className="block text-blue-300 text-xs font-bold mb-2 uppercase tracking-wider">Type</label>
                                <select
                                    value={item.type}
                                    onChange={(e) => updateField('type', e.target.value)}
                                    className="w-full bg-blue-950/50 border-2 border-blue-500/30 focus:border-blue-500 rounded-lg px-4 py-2 text-white font-bold outline-none transition-all"
                                >
                                    {itemTypes.map(t => (
                                        <option key={t} value={t}>{typeTranslations[t]}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Nom & Icône */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-orange-400 text-sm font-bold mb-2 uppercase tracking-wider">Nom</label>
                                <input
                                    type="text"
                                    value={item.nom}
                                    onChange={(e) => updateField('nom', e.target.value)}
                                    className="w-full bg-gray-800/50 border-2 border-orange-500/30 focus:border-orange-500 rounded-lg px-4 py-3 text-white text-lg font-bold outline-none transition-all"
                                />
                            </div>
                            <div className={`bg-gradient-to-br ${colors.bg} border-2 ${colors.border} rounded-xl p-4`}>
                                <label className={`block ${colors.text} text-xs font-bold mb-2 uppercase tracking-wider`}>
                                    Icône
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className={`w-12 h-12 ${colors.text} rounded-lg flex items-center justify-center`}>
                                        {renderIcon(item.icone)}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsIconPickerOpen(true)}
                                        className={`px-4 py-2 bg-gray-950/50 border-2 ${colors.borderFocus} rounded-lg text-white font-bold hover:bg-gray-900 transition-all`}
                                    >
                                        Choisir une icône
                                    </button>
                                </div>
                                <EmojiIconPicker
                                    isOpen={isIconPickerOpen}
                                    onClose={() => setIsIconPickerOpen(false)}
                                    onSelect={handleIconSelect}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-pink-400 text-sm font-bold mb-2 uppercase tracking-wider">Description</label>
                            <textarea
                                value={item.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                rows={3}
                                className="w-full bg-gray-800/50 border-2 border-pink-500/30 focus:border-pink-500 rounded-lg px-4 py-2 text-white outline-none transition-all resize-none"
                            />
                        </div>

                        {/* Statistiques */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className={`${colors.text} text-sm font-bold uppercase tracking-wider flex items-center gap-2`}>
                                    <Star className="animate-spin" size={16} />
                                    Statistiques
                                </label>
                                <button onClick={addStat} className={`bg-gradient-to-r ${colors.glow} text-white px-4 py-2 rounded-lg text-sm font-bold hover:scale-105 transition-transform`}>
                                    <Plus size={16} className="inline" /> Ajouter
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-4 max-h-64 overflow-y-auto pr-2">
                                {Object.entries(item.statistique || {}).map(([key, value]) => (
                                    <div key={key} className="relative group z-0">
                                        <div className={`absolute -inset-1 bg-gradient-to-br ${colors.glow} opacity-0 group-hover:opacity-20 rounded-lg blur transition-all pointer-events-none`}></div>
                                        <div className={`relative bg-gray-800/80 backdrop-blur rounded-lg p-3 border ${colors.border} transition-all z-10`}>
                                            <button
                                                onClick={() => removeStat(key)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20"
                                            >
                                                <X size={12} />
                                            </button>
                                            <input
                                                type="text"
                                                value={key}
                                                onChange={(e) => updateStat(key, e.target.value, value)}
                                                className={`w-full bg-transparent border-0 ${colors.text} text-xs font-bold mb-2 outline-none uppercase`}
                                            />
                                            <input
                                                type="text"
                                                value={value}
                                                onChange={(e) => updateStat(key, key, e.target.value)}
                                                className="w-full bg-transparent border-0 text-white text-sm font-bold outline-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={onSave}
                                disabled={saving}
                                className={`flex-1 bg-gradient-to-r ${colors.glow} text-white font-bold py-4 rounded-xl hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <Save size={20} className="inline mr-2" />
                                {saving ? 'Sauvegarde...' : 'SAUVEGARDER'}
                            </button>
                            <button
                                onClick={onCancel}
                                disabled={saving}
                                className="px-8 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ANNULER
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemEditorModal;
