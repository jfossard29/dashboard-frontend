import React, {useState} from 'react';
import { Plus, Save, X, Star, Flame, Trash2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { rarityTranslations, typeTranslations } from '../traduction/objet';
import { rarityColors } from '../data/objet';
import EmojiIconPicker from "./EmojiIconPicker.jsx";
import TypeDropdown from './TypeDropdown.jsx';
import { getIconUrl } from '../data/icons.js';

const ItemEditorModal = ({
                             item,
                             onCancel,
                             onSave,
                             onDelete, // Nouvelle prop pour la suppression
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

    const standardParts = [
        { value: 'tete', label: 'Tête' },
        { value: 'torse', label: 'Torse' },
        { value: 'pieds', label: 'Pieds' },
        { value: 'deux_mains', label: 'Deux mains' },
        { value: 'main_droite', label: 'Main droite' },
        { value: 'main_gauche', label: 'Main gauche' },
        { value: 'accessoire1', label: 'Accessoire 1' },
        { value: 'accessoire2', label: 'Accessoire 2' }
    ];

    const renderIcon = (iconName) => {
        if (!iconName) return '📦';
        
        // On essaie de résoudre l'URL si c'est un nom de fichier SVG
        const iconUrl = getIconUrl(iconName);
        
        // Check for image file extensions or URLs
        if (typeof iconUrl === 'string' && (
            iconUrl.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i) || 
            iconUrl.startsWith('http') || 
            iconUrl.startsWith('/') ||
            iconUrl.startsWith('data:')
        )) {
            return <img src={iconUrl} alt="" className="w-full h-full object-contain" />;
        }

        if (iconName.length <= 2) return iconName;
        const IconComponent = LucideIcons[iconName];
        if (IconComponent) return <IconComponent size={24} className="text-white" />;
        return '📦';
    };

    const handleIconSelect = (selectedIcon) => {
        updateField('icone', selectedIcon);
    };

    const handlePartieChange = (value) => {
        // Autorise les lettres, chiffres, accents, underscore ET les espaces (\s).
        const sanitizedValue = value.replace(/[^a-zA-Z0-9_À-ÿ\s]/g, '');
        updateField('partie', sanitizedValue);
    };

    const rarityOptions = rarities.map(r => ({ value: r, label: rarityTranslations[r] }));
    const itemTypeOptions = itemTypes.map(t => ({ value: t, label: typeTranslations[t] }));
    const partieOptions = standardParts.map(p => ({ value: p.value, label: p.label }));
    partieOptions.push({ value: 'autre', label: 'Autre...' });

    // Calculs pour les limites
    const statsCount = Object.keys(item.statistique || {}).length;
    const maxStats = 10;
    const maxNameLength = 25;
    const maxPartieLength = 25;
    const maxDescLength = 150;

    // Helper to determine effective partie (default to 'tete' if undefined/null)
    const effectivePartie = item.partie ?? 'tete';

    // Determine title based on context
    let modalTitle = "MODIFICATION D'UN OBJET";
    if (!item.id) {
        // Creation mode
        if (item.prive) {
            modalTitle = "CREATION D'UN OBJET UNIQUE UN PERSONNAGE";
        } else {
            modalTitle = "CREATION D'UN OBJET";
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-8">
            <div className="relative max-w-4xl w-full">
                <div className={`absolute -inset-4 bg-gradient-to-r ${colors.glow} rounded-3xl opacity-30 blur-3xl animate-pulse`}></div>

                <div className={`relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border-2 ${colors.border} shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto`}>
                    <div className="relative p-8 space-y-6">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700/50">
                            <div className="flex items-center gap-3">
                                <Flame className={`${colors.text} animate-pulse`} size={32} />
                                <h2 className={`text-3xl font-bold bg-gradient-to-r ${colors.glow} bg-clip-text text-transparent`}>
                                    {modalTitle}
                                </h2>
                            </div>
                            <button onClick={onCancel} className="text-gray-400 hover:text-white hover:rotate-90 transition-all">
                                <X size={28} />
                            </button>
                        </div>

                        {/* Rareté, Type & Partie */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <TypeDropdown
                                value={item.rarete}
                                onChange={(val) => updateField('rarete', val)}
                                options={rarityOptions}
                                colors={{ bg: colors.bg, border: colors.border, borderFocus: colors.borderFocus, textColor: colors.text }}
                                label="Rareté"
                            />

                            <TypeDropdown
                                value={item.type}
                                onChange={(val) => {
                                    updateField('type', val);
                                    // Default to 'tete' if switching to EQUIPEMENT and partie is not set
                                    if (val === 'EQUIPEMENT' && (item.partie === undefined || item.partie === null)) {
                                        updateField('partie', 'tete');
                                    }
                                }}
                                options={itemTypeOptions}
                                colors={{ bg: 'from-blue-900/40 to-blue-800/20', border: 'border-blue-500/50', borderFocus: 'border-blue-500', textColor: 'text-blue-300' }}
                                label="Type"
                            />
                            
                            {item.type === 'EQUIPEMENT' && (
                                <TypeDropdown
                                    value={standardParts.some(p => p.value === effectivePartie) ? effectivePartie : 'autre'}
                                    onChange={(val) => {
                                        if (val === 'autre') {
                                            updateField('partie', ''); // Clear for custom input
                                        } else {
                                            updateField('partie', val);
                                        }
                                    }}
                                    options={partieOptions}
                                    colors={{ bg: 'from-green-900/40 to-green-800/20', border: 'border-green-500/50', borderFocus: 'border-green-500', textColor: 'text-green-300' }}
                                    label="Partie"
                                />
                            )}
                        </div>
                        
                        {item.type === 'EQUIPEMENT' && !standardParts.some(p => p.value === effectivePartie) && (
                             <div className="mt-[-1rem] mb-6">
                                <div className="flex justify-between mb-2">
                                    <label className="block text-green-400 text-sm font-bold uppercase tracking-wider">Partie Personnalisée</label>
                                    <span className={`text-xs ${item.partie?.length >= maxPartieLength ? 'text-red-400' : 'text-gray-500'}`}>
                                        {item.partie?.length || 0}/{maxPartieLength}
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    value={item.partie || ''}
                                    maxLength={maxPartieLength}
                                    onChange={(e) => handlePartieChange(e.target.value)}
                                    className="w-full bg-gray-800/50 border-2 border-green-500/30 focus:border-green-500 rounded-lg px-4 py-2 text-white outline-none transition-all"
                                    placeholder="Artéfact sacré"
                                />
                            </div>
                        )}


                        {/* Nom & Icône */}
                        <div className="flex gap-6">
                            <div className="flex-1">
                                <div className="flex justify-between mb-2">
                                    <label className="block text-orange-400 text-sm font-bold uppercase tracking-wider">Nom</label>
                                    <span className={`text-xs ${item.nom?.length >= maxNameLength ? 'text-red-400' : 'text-gray-500'}`}>
                                        {item.nom?.length || 0}/{maxNameLength}
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    value={item.nom || ''}
                                    maxLength={maxNameLength}
                                    onChange={(e) => updateField('nom', e.target.value)}
                                    className="w-full bg-gray-800/50 border-2 border-orange-500/30 focus:border-orange-500 rounded-lg px-4 py-3 text-white text-lg font-bold outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className={`block ${colors.text} text-xs font-bold mb-2 uppercase tracking-wider`}>
                                    Icône
                                </label>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsIconPickerOpen(true)}
                                        className={`w-14 h-14 rounded-lg flex items-center justify-center border-2 ${colors.borderFocus} bg-gradient-to-br ${colors.card} shadow-lg transition-all overflow-hidden`}
                                    >
                                        {renderIcon(item.icone)}
                                    </button>
                                </div>
                                <EmojiIconPicker
                                    isOpen={isIconPickerOpen}
                                    onClose={() => setIsIconPickerOpen(false)}
                                    onSelect={handleIconSelect}
                                    cardColor={colors.card}
                                    borderColor={colors.borderFocus}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="block text-pink-400 text-sm font-bold uppercase tracking-wider">Description</label>
                                <span className={`text-xs ${item.description?.length >= maxDescLength ? 'text-red-400' : 'text-gray-500'}`}>
                                    {item.description?.length || 0}/{maxDescLength}
                                </span>
                            </div>
                            <textarea
                                value={item.description || ''}
                                maxLength={maxDescLength}
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
                                    Statistiques <span className="text-gray-500 text-xs ml-2">({statsCount}/{maxStats})</span>
                                </label>
                                <button 
                                    onClick={addStat} 
                                    disabled={statsCount >= maxStats}
                                    className={`bg-gradient-to-r ${colors.glow} text-white px-4 py-2 rounded-lg text-sm font-bold transition-transform ${
                                        statsCount >= maxStats ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                                    }`}
                                >
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
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    defaultValue={key}
                                                    onBlur={(e) => {
                                                        if (e.target.value !== key) {
                                                            updateStat(key, e.target.value, value);
                                                        }
                                                    }}
                                                    className={`w-full bg-gray-900/50 border border-gray-600 rounded px-2 py-1 ${colors.text} text-xs font-bold outline-none uppercase focus:border-blue-500`}
                                                    placeholder="NOM STAT"
                                                />
                                                <input
                                                    type="text"
                                                    value={value}
                                                    onChange={(e) => updateStat(key, key, e.target.value)}
                                                    className="w-full bg-gray-900/50 border border-gray-600 rounded px-2 py-1 text-white text-sm font-bold outline-none focus:border-green-500"
                                                    placeholder="VALEUR"
                                                />
                                            </div>
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
                            
                            {/* Bouton Supprimer (affiché uniquement si l'objet existe déjà et si onDelete est fourni) */}
                            {item.id && onDelete && (
                                <button
                                    onClick={onDelete}
                                    disabled={saving}
                                    className="px-6 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    title="Supprimer l'objet"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}

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