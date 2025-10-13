import React, { useState } from 'react';
import { Sword, Shield, Book, Zap, ChevronRight, X, Menu } from 'lucide-react';

const SidebarMenuLayout = () => {
    const [selectedItem, setSelectedItem] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const items = [
        {
            id: 1,
            titre: "Épée longue enchantée",
            contenu: "Une lame ancienne forgée dans l'acier lunaire, imprégnée de magie élémentaire. Inflige des dégâts de feu supplémentaires. Cette arme légendaire a été transmise de génération en génération.",
            icon: Sword,
            stats: {
                dégâts: "+45",
                bonus: "Feu +20",
                rareté: "Légendaire"
            }
        },
        {
            id: 2,
            titre: "Bouclier du protecteur",
            contenu: "Bouclier en adamantium orné de runes protectrices. Augmente la résistance magique de 30%. Les runes anciennes gravées à sa surface brillent d'une lueur bleutée en présence de danger.",
            icon: Shield,
            stats: {
                défense: "+35",
                résistance: "Magique +30%",
                rareté: "Épique"
            }
        },
        {
            id: 3,
            titre: "Grimoire des ombres",
            contenu: "Livre de sorts anciens contenant des incantations de niveau supérieur. Permet de lancer des sorts d'illusion avancés. Ses pages semblent tourner d'elles-mêmes au vent d'une magie invisible.",
            icon: Book,
            stats: {
                mana: "+100",
                sorts: "3 nouveaux",
                rareté: "Rare"
            }
        },
        {
            id: 4,
            titre: "Anneau de téléportation",
            contenu: "Bijou enchanté permettant de se téléporter sur de courtes distances. 3 charges par jour. L'anneau pulse d'une énergie mystique et chauffe légèrement lors de son utilisation.",
            icon: Zap,
            stats: {
                portée: "15 mètres",
                charges: "3/jour",
                rareté: "Rare"
            }
        }
    ];

    const currentItem = items[selectedItem];
    const CurrentIcon = currentItem.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Menu latéral + Contenu détaillé</h1>
                    <p className="text-gray-400">Cliquez sur un élément pour voir ses détails</p>
                </div>

                <div className="bg-gray-800/40 rounded-xl border border-gray-700/30 overflow-hidden">
                    {/* Header avec titre de section */}
                    <div className="bg-gray-800/60 p-4 border-b border-gray-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Sword size={24} className="text-orange-400" />
                            <h2 className="text-xl font-semibold text-gray-200">Équipement</h2>
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded"
                        >
                            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>

                    <div className="flex">
                        {/* Sidebar Menu */}
                        <div className={`${
                            isSidebarOpen ? 'w-80' : 'w-0 lg:w-80'
                        } transition-all duration-300 overflow-hidden border-r border-gray-700/50 bg-gray-800/20`}>
                            <div className="p-4 space-y-2">
                                {items.map((item, index) => {
                                    const ItemIcon = item.icon;
                                    const isActive = selectedItem === index;

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setSelectedItem(index);
                                                if (window.innerWidth < 1024) {
                                                    setIsSidebarOpen(false);
                                                }
                                            }}
                                            className={`w-full text-left p-4 rounded-lg transition-all group ${
                                                isActive
                                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                                    : 'bg-gray-700/30 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                                    isActive
                                                        ? 'bg-white/20'
                                                        : 'bg-gray-600/50 group-hover:bg-gray-600'
                                                }`}>
                                                    <ItemIcon size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold truncate">{item.titre}</div>
                                                    <div className={`text-xs mt-1 ${
                                                        isActive ? 'text-orange-100' : 'text-gray-500 group-hover:text-gray-400'
                                                    }`}>
                                                        {item.stats.rareté}
                                                    </div>
                                                </div>
                                                <ChevronRight
                                                    size={18}
                                                    className={`flex-shrink-0 transition-all ${
                                                        isActive
                                                            ? 'opacity-100 translate-x-0'
                                                            : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                                                    }`}
                                                />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Footer du menu */}
                            <div className="p-4 border-t border-gray-700/50 mt-4">
                                <div className="text-gray-400 text-sm">
                                    <div className="flex justify-between mb-2">
                                        <span>Total d'objets:</span>
                                        <span className="text-orange-400 font-semibold">{items.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Sélectionné:</span>
                                        <span className="text-orange-400 font-semibold">{selectedItem + 1}/{items.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-8 min-h-[600px]">
                            {/* Animation de transition */}
                            <div className="animate-fadeIn">
                                {/* En-tête du contenu */}
                                <div className="flex items-start gap-6 mb-6">
                                    <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-orange-500/20 border-2 border-orange-500/50 flex items-center justify-center">
                                        <CurrentIcon size={36} className="text-orange-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-3xl font-bold text-orange-400 mb-2">
                                            {currentItem.titre}
                                        </h3>
                                        <div className="flex gap-2">
                      <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-300 text-sm">
                        {currentItem.stats.rareté}
                      </span>
                                            <span className="px-3 py-1 bg-gray-700/50 border border-gray-600/50 rounded-full text-gray-300 text-sm">
                        Objet #{currentItem.id}
                      </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="bg-gray-700/20 rounded-lg p-6 border border-gray-600/30 mb-6">
                                    <h4 className="text-gray-400 text-sm font-semibold mb-3 uppercase tracking-wider">
                                        Description
                                    </h4>
                                    <p className="text-gray-300 leading-relaxed text-lg">
                                        {currentItem.contenu}
                                    </p>
                                </div>

                                {/* Statistiques */}
                                <div className="bg-gray-700/20 rounded-lg p-6 border border-gray-600/30 mb-6">
                                    <h4 className="text-gray-400 text-sm font-semibold mb-4 uppercase tracking-wider">
                                        Statistiques
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        {Object.entries(currentItem.stats).map(([key, value]) => (
                                            <div key={key} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                                                <div className="text-gray-400 text-xs uppercase mb-1">{key}</div>
                                                <div className="text-orange-400 font-bold text-xl">{value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-orange-500/20">
                                        Équiper
                                    </button>
                                    <button className="px-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors">
                                        Détails
                                    </button>
                                    <button className="px-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors">
                                        Vendre
                                    </button>
                                </div>

                                {/* Navigation rapide */}
                                <div className="mt-8 pt-6 border-t border-gray-700/50 flex items-center justify-between">
                                    <button
                                        onClick={() => setSelectedItem((prev) => (prev > 0 ? prev - 1 : items.length - 1))}
                                        className="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-colors"
                                    >
                                        <ChevronRight size={18} className="rotate-180" />
                                        <span>Précédent</span>
                                    </button>
                                    <div className="flex gap-2">
                                        {items.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedItem(index)}
                                                className={`w-2 h-2 rounded-full transition-all ${
                                                    selectedItem === index
                                                        ? 'bg-orange-500 w-6'
                                                        : 'bg-gray-600 hover:bg-gray-500'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setSelectedItem((prev) => (prev < items.length - 1 ? prev + 1 : 0))}
                                        className="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-colors"
                                    >
                                        <span>Suivant</span>
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Informations complémentaires */}
                <div className="mt-6 bg-gray-800/40 rounded-xl p-6 border border-gray-700/30">
                    <h3 className="text-lg font-semibold text-white mb-3">Fonctionnalités interactives :</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-gray-300">
                            <p className="mb-2">✓ Clic sur un élément pour afficher ses détails</p>
                            <p className="mb-2">✓ Indicateur visuel de l'élément actif</p>
                            <p className="mb-2">✓ Animation de transition entre les contenus</p>
                            <p>✓ Boutons de navigation précédent/suivant</p>
                        </div>
                        <div className="text-gray-300">
                            <p className="mb-2">✓ Menu responsive (collapse sur mobile)</p>
                            <p className="mb-2">✓ Compteur d'objets dans le menu</p>
                            <p className="mb-2">✓ Indicateurs de progression (points)</p>
                            <p>✓ Boutons d'action contextuels</p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
        </div>
    );
};

export default SidebarMenuLayout;