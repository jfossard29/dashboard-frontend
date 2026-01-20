import React, { useState, useEffect } from 'react';
import { Search, X, Plus } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useParams } from 'react-router-dom';
import itemService from "../services/objetService.js";
import { getIconUrl } from '../data/icons.js';

const ItemBankModal = ({ isOpen, onClose, onSelect, serverId }) => {
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const params = useParams();
    const effectiveServerId = serverId || params.serverId;

    useEffect(() => {
        if (isOpen) {
            if (effectiveServerId) {
                console.log(`Fetching items for serverId: ${effectiveServerId}`);
                
                const fetchItems = async () => {
                    try {
                        const data = await itemService.getObjets(effectiveServerId);
                        
                        if (data.code === 200 || Array.isArray(data.body) || Array.isArray(data)) {
                            setItems(data.body || data);
                        } else {
                            console.error("Failed to fetch items:", data);
                        }
                    } catch (err) {
                        console.error("Error fetching items:", err);
                    }
                };

                fetchItems();
            } else {
                console.error("ItemBankModal: serverId is missing, cannot fetch items.");
            }
        }
    }, [isOpen, effectiveServerId]);

    const renderIcon = (iconName) => {
        if (!iconName) return <span className="text-xl">📦</span>;
        
        // Résolution de l'URL si c'est un fichier local (ex: .svg)
        const iconUrl = getIconUrl(iconName);

        // Check for image file extensions or URLs
        if (typeof iconUrl === 'string' && (
            iconUrl.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i) || 
            iconUrl.startsWith('http') || 
            iconUrl.startsWith('/') ||
            iconUrl.startsWith('data:')
        )) {
            return <img src={iconUrl} alt="" className="w-8 h-8 object-cover rounded" />;
        }

        const IconComponent = LucideIcons[iconName];
        if (IconComponent) {
            return <IconComponent size={24} />;
        }
        return <span className="text-xl">{iconName}</span>;
    };

    const filteredItems = items.filter(i => i && (i.nom || "").toLowerCase().includes(searchTerm.toLowerCase()));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800/50 rounded-t-xl">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span>🏦</span> Banque d'objets
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-lg transition-colors">
                        <X className="text-gray-400 hover:text-white" />
                    </button>
                </div>
                
                <div className="p-4 border-b border-gray-700/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Rechercher un objet..." 
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-orange-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-3 scrollbar-custom">
                    {filteredItems.map(item => (
                        <div 
                            key={item.id} 
                            className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 flex justify-between items-center hover:border-orange-500 hover:bg-gray-800 transition-all cursor-pointer group" 
                            onClick={() => onSelect(item)}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700 group-hover:border-orange-500/50 transition-colors">
                                    {renderIcon(item.icone)}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-bold text-white truncate">{item.nom}</div>
                                    <div className="text-xs text-gray-400 flex gap-2">
                                        <span className="uppercase">{item.type}</span>
                                        <span>•</span>
                                        <span className={
                                            item.rarete === 'LEGENDARY' ? 'text-orange-400' :
                                            item.rarete === 'EPIC' ? 'text-purple-400' :
                                            item.rarete === 'RARE' ? 'text-blue-400' :
                                            item.rarete === 'UNCOMMON' ? 'text-green-400' : 'text-gray-400'
                                        }>{item.rarete}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-orange-500/10 p-2 rounded-lg group-hover:bg-orange-500 text-orange-500 group-hover:text-white transition-all">
                                <Plus size={20} />
                            </div>
                        </div>
                    ))}
                    {filteredItems.length === 0 && (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            Aucun objet trouvé
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItemBankModal;