import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Save, X, Sword, Shield, Gem, Star, Trash2, ChevronDown, Check, AlertTriangle, Info } from 'lucide-react';
import '../Scrollbar.css';

// Composant Popup
const Popup = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Attendre la fin de l'animation
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const getPopupStyle = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
          icon: <Check size={20} />,
          border: 'border-green-400'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-red-600',
          icon: <AlertTriangle size={20} />,
          border: 'border-red-400'
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
          icon: <Info size={20} />,
          border: 'border-blue-400'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
          icon: <Info size={20} />,
          border: 'border-gray-400'
        };
    }
  };

  const style = getPopupStyle();

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 transform ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
    }`}>
      <div className={`${style.bg} ${style.border} border backdrop-blur-sm rounded-xl p-4 shadow-2xl min-w-80 max-w-96`}>
        <div className="flex items-center space-x-3">
          <div className="text-white">
            {style.icon}
          </div>
          <div className="flex-1">
            <p className="text-white font-medium text-sm leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-white/80 hover:text-white transition-colors duration-200"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ItemsManagementPage = ({ onBack }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedItem, setEditedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [popup, setPopup] = useState({ message: '', type: '' });
  const [filters, setFilters] = useState({
    équipement: true,
    consommable: true,
    autre: true
  });
  const [sortBy, setSortBy] = useState('nom');
  const [items, setItems] = useState([
    {
      id: 1,
      name: 'Épée de Flammes Éternelles',
      description: 'Une épée légendaire forgée dans les flammes du dragon ancien. Ses lames brillent d\'un éclat rouge intense.',
      type: 'équipement',
      rarity: 'légendaire',
      stats: {
        force: 85,
        magie: 45,
        agilité: 20,
        défense: 10
      },
      icon: '🗡️',
      color: 'from-red-500 to-orange-600'
    },
    {
      id: 2,
      name: 'Bouclier de Protection Divine',
      description: 'Bouclier béni par les dieux, offrant une protection magique contre les sorts maléfiques.',
      type: 'équipement',
      rarity: 'épique',
      stats: {
        force: 15,
        magie: 30,
        agilité: -5,
        défense: 95
      },
      icon: '🛡️',
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 3,
      name: 'Potion de Guérison Majeure',
      description: 'Potion magique aux propriétés curatives exceptionnelles. Restaure instantanément les blessures.',
      type: 'consommable',
      rarity: 'rare',
      stats: {
        force: 0,
        magie: 0,
        agilité: 0,
        défense: 0
      },
      icon: '🧪',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 4,
      name: 'Amulette des Vents',
      description: 'Bijou mystique qui augmente considérablement la vitesse et l\'agilité de son porteur.',
      type: 'autre',
      rarity: 'rare',
      stats: {
        force: 10,
        magie: 25,
        agilité: 60,
        défense: 5
      },
      icon: '💎',
      color: 'from-cyan-500 to-teal-600'
    }
  ]);

  const itemTypes = ['équipement', 'consommable', 'autre'];
  const rarities = ['commun', 'rare', 'épique', 'légendaire'];
  const statNames = ['force', 'magie', 'agilité', 'défense'];
  const sortOptions = [
    { value: 'nom', label: 'Nom' },
    { value: 'type', label: 'Type' },
    { value: 'rarity', label: 'Rareté' }
  ];

  const showPopup = (message, type) => {
    setPopup({ message, type });
  };

  const closePopup = () => {
    setPopup({ message: '', type: '' });
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'commun': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'épique': return 'text-purple-400';
      case 'légendaire': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getRarityOrder = (rarity) => {
    switch (rarity) {
      case 'commun': return 1;
      case 'rare': return 2;
      case 'épique': return 3;
      case 'légendaire': return 4;
      default: return 0;
    }
  };

  const toggleFilter = (type) => {
    setFilters(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const filteredAndSortedItems = items
    .filter(item => 
      filters[item.type] && 
      (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.type.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'nom':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'rarity':
          return getRarityOrder(b.rarity) - getRarityOrder(a.rarity);
        default:
          return 0;
      }
    });

  const startEdit = () => {
    setEditedItem({ ...selectedItem });
    setEditMode(true);
    showPopup(`Mode édition activé pour "${selectedItem.name}"`, 'info');
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditedItem(null);
    showPopup('Modifications annulées', 'info');
  };

  const saveItem = () => {
    const isNewItem = !items.some(item => item.id === editedItem.id);
    
    setItems(prev => {
      if (isNewItem) {
        return [...prev, editedItem];
      } else {
        return prev.map(item => item.id === editedItem.id ? editedItem : item);
      }
    });
    
    setSelectedItem(editedItem);
    setEditMode(false);
    setEditedItem(null);
    
    if (isNewItem) {
      showPopup(`Objet "${editedItem.name}" créé avec succès !`, 'success');
    } else {
      showPopup(`Objet "${editedItem.name}" modifié avec succès !`, 'success');
    }
  };

  const addNewItem = () => {
    const newItem = {
      id: Date.now(),
      name: 'Nouvel Objet',
      description: 'Description de l\'objet',
      type: 'équipement',
      rarity: 'commun',
      stats: { force: 0, magie: 0, agilité: 0, défense: 0 },
      icon: '⚔️',
      color: 'from-gray-500 to-gray-600'
    };
    setSelectedItem(newItem);
    setEditedItem({ ...newItem });
    setEditMode(true);
    setShowAddModal(false);
    showPopup('Nouvel objet créé, vous pouvez maintenant le modifier', 'info');
  };

  const deleteItem = (itemId) => {
    const itemToDelete = items.find(item => item.id === itemId);
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${itemToDelete?.name}" ?`)) {
      setItems(prev => prev.filter(item => item.id !== itemId));
      if (selectedItem?.id === itemId) {
        setSelectedItem(null);
        setEditMode(false);
        setEditedItem(null);
      }
      showPopup(`Objet "${itemToDelete?.name}" supprimé avec succès`, 'success');
    }
  };

  const updateField = (field, value) => {
    setEditedItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateStat = (statName, value) => {
    setEditedItem(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [statName]: parseInt(value) || 0
      }
    }));
  };

  if (selectedItem) {
    const currentItem = editMode ? editedItem : selectedItem;
    
    return (
      <>
        <div className="flex-1 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 ml-20 pt-20 p-6">
          {/* Header avec retour et actions */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedItem(null)}
              className="text-orange-400 hover:text-orange-300 transition-colors duration-200 flex items-center space-x-2"
            >
              <span>←</span>
              <span>Retour à la liste</span>
            </button>
            
            <div className="flex items-center space-x-3">
              {editMode ? (
                <>
                  <button
                    onClick={saveItem}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
                  >
                    <Save size={18} />
                    <span>Sauvegarder</span>
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
                  >
                    <X size={18} />
                    <span>Annuler</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={startEdit}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
                  >
                    <Edit3 size={18} />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => deleteItem(currentItem.id)}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
                  >
                    <Trash2 size={18} />
                    <span>Supprimer</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Détail de l'objet */}
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl">
            {/* En-tête de l'objet */}
            <div className={`relative p-8 bg-gradient-to-r ${currentItem.color}/20`}>
              <div className="flex items-start space-x-6">
                <div className={`w-32 h-32 bg-gradient-to-r ${currentItem.color} rounded-2xl flex items-center justify-center text-6xl shadow-2xl`}>
                  {editMode ? (
                    <input
                      type="text"
                      value={currentItem.icon}
                      onChange={(e) => updateField('icon', e.target.value)}
                      className="w-20 h-20 bg-transparent text-center text-6xl outline-none"
                      maxLength="2"
                    />
                  ) : (
                    currentItem.icon
                  )}
                </div>
                <div className="flex-1">
                  {editMode ? (
                    <input
                      type="text"
                      value={currentItem.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="text-4xl font-bold bg-transparent text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-2 border-b-2 border-orange-400/50 focus:border-orange-400 outline-none w-full"
                    />
                  ) : (
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-2">
                      {currentItem.name}
                    </h1>
                  )}
                  
                  <div className="flex items-center space-x-4 mb-4">
                    {editMode ? (
                      <>
                        <select
                          value={currentItem.type}
                          onChange={(e) => updateField('type', e.target.value)}
                          className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-orange-500"
                        >
                          {itemTypes.map(type => (
                            <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                          ))}
                        </select>
                        <select
                          value={currentItem.rarity}
                          onChange={(e) => updateField('rarity', e.target.value)}
                          className={`bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-orange-500`}
                        >
                          {rarities.map(rarity => (
                            <option key={rarity} value={rarity}>{rarity.charAt(0).toUpperCase() + rarity.slice(1)}</option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <>
                        <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                          {currentItem.type.charAt(0).toUpperCase() + currentItem.type.slice(1)}
                        </span>
                        <span className={`font-bold text-lg ${getRarityColor(currentItem.rarity)}`}>
                          ★ {currentItem.rarity.charAt(0).toUpperCase() + currentItem.rarity.slice(1)}
                        </span>
                      </>
                    )}
                  </div>
                  
                  {editMode ? (
                    <textarea
                      value={currentItem.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      className="text-gray-300 text-lg leading-relaxed w-full bg-gray-800/50 border border-gray-600 rounded-lg p-3 resize-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                      rows="3"
                    />
                  ) : (
                    <p className="text-gray-300 text-lg leading-relaxed">
                      {currentItem.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-orange-400 mb-6 flex items-center">
                <span className="mr-3 text-3xl">📊</span>
                Statistiques
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {statNames.map(statName => (
                  <div key={statName} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                    <div className="text-gray-400 text-sm mb-1 capitalize">{statName}</div>
                    {editMode ? (
                      <input
                        type="number"
                        value={currentItem.stats[statName]}
                        onChange={(e) => updateStat(statName, e.target.value)}
                        className="w-full bg-gray-700 text-white text-2xl font-bold rounded px-2 py-1 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                      />
                    ) : (
                      <div className={`text-2xl font-bold ${
                        currentItem.stats[statName] > 0 ? 'text-green-400' : 
                        currentItem.stats[statName] < 0 ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {currentItem.stats[statName] > 0 ? '+' : ''}{currentItem.stats[statName]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Popup message={popup.message} type={popup.type} onClose={closePopup} />
      </>
    );
  }

  return (
    <>
      <div className="flex-1 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 ml-20 h-screen flex flex-col pt-20">
        {/* Header fixe */}
        <div className="flex-shrink-0 p-6 pb-0">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-2">
                Gestion des Objets
              </h1>
              <p className="text-gray-400">Gérez votre inventaire et créez de nouveaux objets</p>
            </div>
            <button
              onClick={addNewItem}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg transform hover:scale-105"
            >
              <Plus size={20} />
              <span>Nouvel Objet</span>
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="mb-6 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un objet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-white placeholder-gray-400 transition-all duration-200"
            />
          </div>

          {/* Filtres et tri */}
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
            {/* Filtres par type */}
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
                  <span className={`text-sm capitalize transition-colors duration-200 group-hover:text-orange-400 ${
                    filters[type] ? 'text-white font-medium' : 'text-gray-400'
                  }`}>
                    {type}
                  </span>
                </label>
              ))}
            </div>

            {/* Tri */}
            <div className="flex items-center space-x-3">
              <span className="text-gray-300 font-medium">Trier par :</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-gray-700 text-white px-4 py-2 pr-8 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          {/* Compteur d'objets */}
          <div className="mb-4">
            <p className="text-gray-400 text-sm">
              {filteredAndSortedItems.length} objet(s) trouvé(s)
            </p>
          </div>
        </div>

        {/* Zone scrollable */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-2">
            {filteredAndSortedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300 cursor-pointer group hover:shadow-2xl shadow-lg hover:-translate-y-1"
              >
                <div className="flex items-start space-x-4 mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors duration-200 mb-1">
                      {item.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                        {item.type}
                      </span>
                      <span className={`text-sm font-medium ${getRarityColor(item.rarity)}`}>
                        {item.rarity}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                  {item.description}
                </p>
                
                {/* Aperçu des stats principales */}
                <div className="flex items-center justify-between text-xs">
                  {Object.entries(item.stats).slice(0, 2).map(([stat, value]) => (
                    <div key={stat} className="flex items-center space-x-1">
                      <span className="text-gray-400 capitalize">{stat}:</span>
                      <span className={value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-400'}>
                        {value > 0 ? '+' : ''}{value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Popup message={popup.message} type={popup.type} onClose={closePopup} />
    </>
  );
};

export default ItemsManagementPage;