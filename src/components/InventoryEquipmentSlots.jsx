import React from 'react';
import { X, Plus, Lock, Trash2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { getIconUrl } from '../data/icons.js';

const InventoryEquipmentSlots = ({
    inventoryData,
    editMode,
    highlightedSlots,
    handleDragOver,
    handleDropOnSlot,
    handleDragStart,
    handleDragEnd,
    unequipItem,
    handleAddSlot,
    handleRemoveSlot,
    setHoveredStatsExpand,
    hoveredStatsExpand
}) => {
    const rarityColors = {
        'COMMON': { bg: 'from-gray-500 to-gray-600', text: 'text-gray-400', border: 'border-gray-500' },
        'UNCOMMON': { bg: 'from-green-500 to-green-600', text: 'text-green-400', border: 'border-green-500' },
        'RARE': { bg: 'from-blue-500 to-blue-600', text: 'text-blue-400', border: 'border-blue-500' },
        'EPIC': { bg: 'from-purple-500 to-purple-600', text: 'text-purple-400', border: 'border-purple-500' },
        'LEGENDARY': { bg: 'from-orange-500 to-pink-500', text: 'text-orange-400', border: 'border-orange-500' }
    };

    const slotLabels = {
        tete: "Tête",
        torse: "Torse",
        deuxMains: "Deux mains",
        mainDroite: "Main droite",
        mainGauche: "Main gauche",
        pieds: "Pieds",
        accessoire1: "Accessoire 1",
        accessoire2: "Accessoire 2"
    };

    const formatLabel = (slug) => {
        if (slotLabels[slug]) return slotLabels[slug];
        return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/_/g, ' ');
    };

    const renderItemIcon = (iconName) => {
        if (!iconName) return <span className="text-2xl">❓</span>;

        // Résolution de l'URL si c'est un fichier local (ex: .svg)
        const iconUrl = getIconUrl(iconName);

        if (typeof iconUrl === 'string' && (
            iconUrl.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i) || 
            iconUrl.startsWith('http') || 
            iconUrl.startsWith('/') ||
            iconUrl.startsWith('data:')
        )) {
            return <img src={iconUrl} alt="" className="w-full h-full object-cover rounded" />;
        }

        const IconComponent = LucideIcons[iconName];
        if (IconComponent) {
            return <IconComponent size={24} />;
        }

        return <span>{iconName}</span>;
    };

    const getValidSlots = (item) => {
        if (!item || !item.partie) return [];
        const part = item.partie.toLowerCase();
        
        if (['tete', 'casque', 'heaume'].includes(part)) return ['tete'];
        if (['torse', 'plastron', 'armure'].includes(part)) return ['torse'];
        if (['pied', 'pieds', 'bottes', 'jambieres'].includes(part)) return ['pieds'];
        if (['deux_mains', 'arme_deux_mains', 'baton', 'arc'].includes(part)) return ['deuxMains'];
        if (['main_droite', 'arme_main_droite', 'epee', 'dague'].includes(part)) return ['mainDroite'];
        if (['main_gauche', 'arme_main_gauche', 'bouclier'].includes(part)) return ['mainGauche'];
        if (['accessoire', 'anneau', 'collier', 'bijou', 'accessoire1', 'accessoire2'].includes(part)) return ['accessoire1', 'accessoire2'];
        
        return [item.partie];
    };

    const isTwoHanded = (item) => {
        return item?.deuxMains || getValidSlots(item).includes('deuxMains');
    };

    const isSpecial = (item, slot) => {
        if (!item || item.type !== 'EQUIPEMENT') return false;
        if (!slot) return false;

        const standardSlots = ['tete', 'torse', 'pieds', 'deuxMains', 'mainDroite', 'mainGauche', 'accessoire1', 'accessoire2'];
        if (standardSlots.includes(slot)) return false;

        const standardParts = ['tete', 'torse', 'pieds', 'pied', 'deux_mains', 'main_droite', 'main_gauche', 'accessoire_1', 'accessoire_2', 'accessoire'];
        if (standardParts.includes(slot)) return false;

        return true;
    };

    const isSlotDisabled = (slot) => {
        if ((slot === 'mainDroite' || slot === 'mainGauche') && inventoryData.equipement.deuxMains) {
            return true;
        }
        if (slot === 'deuxMains' && (inventoryData.equipement.mainDroite || inventoryData.equipement.mainGauche)) {
            return true;
        }
        return false;
    };

    const isCustomSlot = (slot) => {
        const standardSlots = ['tete', 'torse', 'deuxMains', 'mainDroite', 'mainGauche', 'pieds', 'accessoire1', 'accessoire2'];
        return !standardSlots.includes(slot);
    };

    return (
        <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-orange-400 flex items-center gap-2">
                    <span>⚔️</span>
                    Équipement actuel
                </h3>
                <div className="flex gap-4 text-xs text-gray-400 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-1">
                        <span className="text-orange-400">⚔️</span> 2 Mains
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-purple-400">✨</span> Slot spécial
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-cyan-400"><Lock size={12} /></span> Unique au personnage
                    </div>
                </div>
            </div>
            <div className="space-y-3">
                {Object.entries(inventoryData.equipement).map(([slot, item]) => {
                    const disabled = isSlotDisabled(slot);
                    const isSpecialSlot = isSpecial(item, slot);
                    const isHighlighted = highlightedSlots.includes(slot);
                    const isCustom = isCustomSlot(slot);
                    
                    const colors = item ? (rarityColors[item.rarete] || rarityColors['COMMON']) : null;

                    return (
                        <div
                            key={slot}
                            onDragOver={!disabled ? handleDragOver : undefined}
                            onDrop={!disabled ? (e) => handleDropOnSlot(e, slot) : undefined}
                            className={`bg-gray-700/30 rounded-lg p-3 flex items-center gap-4 border transition-all duration-300 min-h-[6rem] ${
                            disabled ? 'border-gray-700/30 opacity-50' : 
                            isHighlighted ? 'border-green-500 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.3)] scale-[1.02]' :
                            'border-gray-600/50 hover:border-orange-500/50'
                        }`}>
                            <div className="text-gray-400 text-sm font-semibold w-32 flex items-center gap-2">
                                {editMode && isCustom && (
                                    <button 
                                        onClick={() => handleRemoveSlot(slot)}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 rounded transition-colors"
                                        title="Supprimer l'emplacement"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                                {formatLabel(slot)}
                                {isSpecialSlot && <span className="text-xs text-purple-400">✨</span>}
                                {slot === 'deuxMains' && <span className="text-xs text-orange-400">⚔️</span>}
                            </div>
                            {item ? (
                                <div
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, item, "equipment", slot)}
                                    onDragEnd={handleDragEnd}
                                    className="flex-1 flex items-center gap-3 bg-gray-800/50 rounded-lg p-3 border border-gray-600 hover:border-orange-500/50 transition-all group cursor-grab active:cursor-grabbing min-h-full relative"
                                >
                                    <div
                                        className={`w-14 h-14 rounded bg-gradient-to-br ${colors.bg} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform relative flex-shrink-0`}
                                    >
                                        {renderItemIcon(item.icone)}
                                        {item.prive && (
                                            <div className="absolute -top-1 -left-1 bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" title="Objet unique au personnage">
                                                <Lock size={12} />
                                            </div>
                                        )}
                                        {isTwoHanded(item) && (
                                            <>
                                                <div className="absolute -bottom-1 -left-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                    ⚔️
                                                </div>
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                    ⚔️
                                                </div>
                                            </>
                                        )}
                                        {isSpecialSlot && (
                                            <div className="absolute -bottom-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                ✨
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 w-0 flex flex-col justify-center gap-1">
                                        <div className={`font-bold ${colors.text} truncate`}>{item.nom}</div>
                                        <div className="text-xs text-gray-400 flex flex-wrap gap-x-3 gap-y-1">
                                            {Object.entries(item.statistique || {}).slice(0, 3).map(([s, v], idx) => (
                                                <span key={s}>{s}: <span className="text-green-400">{v}</span></span>
                                            ))}
                                            {Object.keys(item.statistique || {}).length > 3 && (
                                                <span
                                                    className="text-orange-400 hover:text-orange-300 cursor-help relative"
                                                    onMouseEnter={() => setHoveredStatsExpand(`${slot}-${item.id}`)}
                                                    onMouseLeave={() => setHoveredStatsExpand(null)}
                                                >
                                                    +{Object.keys(item.statistique || {}).length - 3} stats

                                                    {/* Popup des stats supplémentaires */}
                                                    {hoveredStatsExpand === `${slot}-${item.id}` && (
                                                        <div className="absolute left-0 top-full mt-1 bg-gray-900 border-2 border-orange-500 rounded-lg p-3 w-64 shadow-2xl z-50 pointer-events-none">
                                                            <div className="text-xs font-bold text-orange-400 mb-2">Stats supplémentaires :</div>
                                                            <div className="space-y-1">
                                                                {Object.entries(item.statistique || {}).slice(3).map(([stat, value]) => (
                                                                    <div key={stat} className="flex justify-between text-xs">
                                                                        <span className="text-gray-300">{stat}:</span>
                                                                        <span className="text-green-400 font-bold">{value}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                        {item.description && (
                                            <div className="text-xs text-gray-400 italic break-words mt-1">
                                                {item.description}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => unequipItem(slot)}
                                        className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded transition-colors self-start"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ) : disabled ? (
                                <div className="flex-1 border-2 border-dashed border-gray-700/30 rounded-lg p-4 text-center text-gray-600 cursor-not-allowed h-full flex items-center justify-center">
                                    {slot === 'deuxMains'
                                        ? 'Déséquipez les mains'
                                        : 'Déséquipez l\'arme à 2 mains'}
                                </div>
                            ) : (
                                <div className={`flex-1 border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer h-full flex items-center justify-center ${
                                    isHighlighted 
                                        ? 'border-green-500 text-green-400 bg-green-500/5' 
                                        : 'border-gray-600 text-gray-500 hover:border-orange-500/50 hover:text-gray-400'
                                }`}>
                                    {isHighlighted ? 'Déposer ici' : 'Vide - Glissez un objet ici'}
                                </div>
                            )}
                        </div>
                    );
                })}
                {editMode && (
                    <button
                        onClick={handleAddSlot}
                        className="w-full py-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-orange-500 hover:text-orange-400 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={20} />
                        Ajouter un emplacement
                    </button>
                )}
            </div>
        </div>
    );
};

export default InventoryEquipmentSlots;