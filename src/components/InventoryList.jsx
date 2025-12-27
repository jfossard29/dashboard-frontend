import React from 'react';
import { Search, Plus, Edit2, Trash2, Lock } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { getIconUrl } from '../data/icons.js';

const InventoryList = ({
    inventory,
    editMode,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDropOnInventory,
    setShowItemBank,
    openEditorForNew,
    openEditorForEdit,
    handleDeleteItem,
    setHoveredItem,
    hoveredItem,
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

    const filteredInventory = inventory.filter(item => 
        item && (item.nom || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredInventory.length / itemsPerPage) || 1;
    const currentItems = filteredInventory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div
            onDragOver={handleDragOver}
            onDrop={handleDropOnInventory}
            className="w-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border-2 border-gray-700/50 shadow-2xl sticky top-6 self-start"
        >
            <h3 className="text-2xl font-bold text-orange-400 mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                    <span>💼</span>
                    Inventaire
                </span>
                <div className="flex items-center gap-2">
                    {editMode && (
                        <>
                            <button
                                onClick={() => setShowItemBank(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-lg transition-colors"
                                title="Ajouter depuis la banque"
                            >
                                <Search size={16} />
                            </button>
                            <button
                                onClick={openEditorForNew}
                                className="bg-green-600 hover:bg-green-700 text-white p-1.5 rounded-lg transition-colors"
                                title="Créer un objet"
                            >
                                <Plus size={16} />
                            </button>
                        </>
                    )}
                    <span className="text-sm text-gray-400 font-normal">
                        {filteredInventory.length} objet(s)
                    </span>
                </div>
            </h3>

            {/* Barre de recherche */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                />
            </div>

            {/* Liste des objets (Paginée) */}
            <div className="space-y-2 min-h-[200px]">
                {currentItems.length > 0 ? (
                    currentItems.map(item => {
                        const colors = rarityColors[item.rarete] || rarityColors['COMMON'];
                        const isDisabled = item.quantite <= 0;
                        
                        return (
                            <div
                                key={item.id}
                                draggable={!isDisabled}
                                onDragStart={(e) => handleDragStart(e, item, "inventory")}
                                onDragEnd={handleDragEnd}
                                className={`bg-gray-700/30 rounded-lg p-3 flex items-center gap-3 border-l-4 ${colors.border} group relative transition-all ${
                                    isDisabled 
                                        ? 'cursor-not-allowed' 
                                        : 'hover:bg-gray-700/50 cursor-grab active:cursor-grabbing'
                                }`}
                                onMouseEnter={() => setHoveredItem(item.id)}
                                onMouseLeave={() => setHoveredItem(null)}
                            >
                                <div className={`w-14 h-14 rounded bg-gradient-to-br ${colors.bg} flex items-center justify-center text-2xl relative shadow-lg ${!isDisabled && 'group-hover:scale-110'} transition-transform ${isDisabled ? 'opacity-50 grayscale' : ''}`}>
                                    {renderItemIcon(item.icone)}
                                    {item.prive && (
                                        <div className="absolute -top-1 -left-1 bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" title="Objet unique au personnage">
                                            <Lock size={12} />
                                        </div>
                                    )}
                                    {item.quantite > 1 && (
                                        <div className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-gray-700">
                                            {item.quantite}
                                        </div>
                                    )}
                                    {isDisabled && (
                                        <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                                            <span className="text-xs font-bold text-white">0</span>
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
                                    {isSpecial(item, item.partie) && (
                                        <div className="absolute -bottom-1 -left-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            ✨
                                        </div>
                                    )}
                                </div>
                                <div className={`flex-1 min-w-0 ${isDisabled ? 'opacity-50 grayscale' : ''}`}>
                                    <div className={`font-bold text-sm ${colors.text} truncate flex items-center gap-2`}>
                                        {item.nom}
                                        {isTwoHanded(item) && <span className="text-xs text-orange-400">⚔️</span>}
                                        {isSpecial(item, item.partie) && <span className="text-xs text-purple-400">✨</span>}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-x-2 gap-y-1">
                                        {Object.entries(item.statistique || {}).slice(0, 3).map(([s, v], idx) => (
                                            <span key={s}>
                                                {s}: <span className="text-green-400">{v}</span>
                                                {idx < Math.min(2, Object.entries(item.statistique || {}).length - 1) && ','}
                                            </span>
                                        ))}
                                        {Object.keys(item.statistique || {}).length > 3 && (
                                            <span
                                                className="text-orange-400 hover:text-orange-300 cursor-help relative"
                                                onMouseEnter={() => setHoveredStatsExpand(`inv-${item.id}`)}
                                                onMouseLeave={() => setHoveredStatsExpand(null)}
                                            >
                                                +{Object.keys(item.statistique || {}).length - 3}

                                                {/* Popup des stats supplémentaires */}
                                                {hoveredStatsExpand === `inv-${item.id}` && (
                                                    <div className="absolute left-0 top-full mt-1 bg-gray-900 border-2 border-orange-500 rounded-lg p-3 w-56 shadow-2xl z-50 pointer-events-none">
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
                                </div>

                                {/* Actions en mode édition */}
                                {editMode && (
                                    <div className="flex flex-col gap-1 ml-2">
                                        <button
                                            onClick={() => openEditorForEdit(item)}
                                            className="p-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded transition-colors"
                                            title="Modifier"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="p-1 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded transition-colors"
                                            title="Supprimer"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}

                                {/* Tooltip au survol (si pas en mode édition ou si survolé ailleurs) */}
                                {hoveredItem === item.id && (
                                    <div className="absolute right-full mr-3 top-0 bg-gray-900 border-2 border-orange-500 rounded-lg p-4 w-72 shadow-2xl z-50 pointer-events-none max-h-96 overflow-y-auto">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className={`font-bold text-lg ${colors.text}`}>{item.nom}</h4>
                                            <div className="flex gap-1">
                                                {isTwoHanded(item) && (
                                                    <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded font-bold">
                                                        2 MAINS
                                                    </span>
                                                )}
                                                {isSpecial(item, item.partie) && (
                                                    <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded font-bold">
                                                        SPECIAL
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {Object.entries(item.statistique || {}).map(([stat, value]) => (
                                                <div key={stat} className="flex justify-between text-sm border-b border-gray-800 pb-1">
                                                    <span className="text-gray-300">{stat}:</span>
                                                    <span className="text-green-400 font-bold">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {item.quantite > 1 && (
                                            <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
                                                Quantité: {item.quantite}
                                            </div>
                                        )}
                                        {isDisabled && (
                                            <div className="mt-3 pt-3 border-t border-red-900/50 text-xs text-red-400 font-bold">
                                                Épuisé
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        Aucun objet trouvé
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-gray-700/50">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-lg font-bold text-sm transition-all ${
                                currentPage === page
                                    ? 'bg-orange-500 text-white shadow-lg scale-110'
                                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InventoryList;