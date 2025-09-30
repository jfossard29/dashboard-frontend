import React, { useState } from 'react';
import { Search, Plus, X, Save, Settings, Users, Shield, Bell, Palette, Globe, Trash2, Crown } from 'lucide-react';
import '../Scrollbar.css';

// Composant Popup (réutilisé de la page précédente)
const Popup = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
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
          icon: <Shield size={20} />,
          border: 'border-green-400'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-red-600',
          icon: <X size={20} />,
          border: 'border-red-400'
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
          icon: <Settings size={20} />,
          border: 'border-blue-400'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
          icon: <Settings size={20} />,
          border: 'border-gray-400'
        };
    }
  };

  const style = getPopupStyle();

  return (
    <div className={`fixed bottom-6 left-6 z-50 transition-all duration-300 transform ${
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

const ConfigurationPage = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState('admins');
  const [searchTerm, setSearchTerm] = useState('');
  const [popup, setPopup] = useState({ message: '', type: '' });
  
  // États pour la gestion des admins
  const [admins, setAdmins] = useState([
    {
      id: 1,
      name: 'Alexandre',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
      role: 'Super Admin',
      addedAt: '2024-01-15',
      permissions: ['all']
    },
    {
      id: 2,
      name: 'Sarah',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b2e4?w=100&h=100&fit=crop&crop=face',
      role: 'Modérateur',
      addedAt: '2024-02-10',
      permissions: ['manage_characters', 'manage_items']
    }
  ]);

  const [availableCreators, setAvailableCreators] = useState([
    {
      id: 3,
      name: 'Marcus',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 4,
      name: 'Luna',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 5,
      name: 'Thomas',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 6,
      name: 'Emma',
      avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&h=100&fit=crop&crop=face'
    }
  ]);

  // Sections de configuration
  const configSections = [
    { id: 'admins', name: 'Administrateurs', icon: Users, color: 'from-blue-500 to-purple-600' },
    { id: 'notifications', name: 'Notifications', icon: Bell, color: 'from-yellow-500 to-orange-600' },
    { id: 'appearance', name: 'Apparence', icon: Palette, color: 'from-pink-500 to-red-600' },
    { id: 'general', name: 'Général', icon: Globe, color: 'from-green-500 to-emerald-600' }
  ];

  const showPopup = (message, type) => {
    setPopup({ message, type });
  };

  const closePopup = () => {
    setPopup({ message: '', type: '' });
  };

  const addAdmin = (creator) => {
    const newAdmin = {
      ...creator,
      role: 'Modérateur',
      addedAt: new Date().toISOString().split('T')[0],
      permissions: ['manage_characters']
    };
    
    setAdmins(prev => [...prev, newAdmin]);
    setAvailableCreators(prev => prev.filter(c => c.id !== creator.id));
    showPopup(`${creator.name} a été ajouté comme administrateur`, 'success');
  };

  const removeAdmin = (adminId) => {
    const admin = admins.find(a => a.id === adminId);
    if (admin && admin.role !== 'Super Admin') {
      if (window.confirm(`Êtes-vous sûr de retirer ${admin.name} des administrateurs ?`)) {
        setAdmins(prev => prev.filter(a => a.id !== adminId));
        setAvailableCreators(prev => [...prev, { id: admin.id, name: admin.name, avatar: admin.avatar }]);
        showPopup(`${admin.name} a été retiré des administrateurs`, 'success');
      }
    } else if (admin?.role === 'Super Admin') {
      showPopup('Impossible de retirer un Super Admin', 'error');
    }
  };

  const filteredCreators = availableCreators.filter(creator =>
    creator.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderAdminSection = () => (
    <div className="space-y-6">
      {/* Header de section */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 p-6 rounded-2xl border border-blue-500/30">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
          <Users className="mr-3" size={28} />
          Gestion des Administrateurs
        </h2>
        <p className="text-gray-300">Ajoutez ou retirez des créateurs de la liste des administrateurs du bot</p>
      </div>

      {/* Liste des admins actuels */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center">
          <Shield className="mr-2" size={20} />
          Administrateurs actuels ({admins.length})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {admins.map((admin) => (
            <div key={admin.id} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={admin.avatar}
                  alt={admin.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-orange-400 shadow-lg"
                />
                <div>
                  <h4 className="text-white font-semibold flex items-center">
                    {admin.name}
                    {admin.role === 'Super Admin' && (
                      <Crown className="ml-2 text-yellow-400" size={16} />
                    )}
                  </h4>
                  <p className={`text-sm ${admin.role === 'Super Admin' ? 'text-yellow-400' : 'text-blue-400'}`}>
                    {admin.role}
                  </p>
                  <p className="text-xs text-gray-500">Ajouté le {admin.addedAt}</p>
                </div>
              </div>
              
              {admin.role !== 'Super Admin' && (
                <button
                  onClick={() => removeAdmin(admin.id)}
                  className="text-red-400 hover:text-red-300 transition-colors duration-200 p-2 hover:bg-red-500/10 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ajouter des admins */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center">
          <Plus className="mr-2" size={20} />
          Ajouter des administrateurs
        </h3>

        {/* Barre de recherche */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un créateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-white placeholder-gray-400 transition-all duration-200"
          />
        </div>

        {/* Liste des créateurs disponibles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto scrollbar-custom">
          {filteredCreators.map((creator) => (
            <div
              key={creator.id}
              className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30 hover:border-orange-500/50 transition-all duration-300 group cursor-pointer"
              onClick={() => addAdmin(creator)}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-600 group-hover:border-orange-400 transition-colors duration-200"
                />
                <div className="flex-1">
                  <h4 className="text-white font-medium group-hover:text-orange-400 transition-colors duration-200">
                    {creator.name}
                  </h4>
                  <p className="text-xs text-gray-500">Cliquer pour ajouter</p>
                </div>
                <Plus className="text-gray-500 group-hover:text-orange-400 transition-colors duration-200" size={16} />
              </div>
            </div>
          ))}
          
          {filteredCreators.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">Aucun créateur disponible</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPlaceholderSection = (sectionName) => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-600/20 to-gray-700/20 p-6 rounded-2xl border border-gray-600/30">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
          <Settings className="mr-3" size={28} />
          {sectionName}
        </h2>
        <p className="text-gray-300">Cette section sera développée prochainement</p>
      </div>

      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-12 text-center">
        <Settings className="mx-auto text-gray-500 mb-4" size={48} />
        <h3 className="text-xl font-bold text-gray-400 mb-2">Section en développement</h3>
        <p className="text-gray-500">Les paramètres de {sectionName.toLowerCase()} seront bientôt disponibles</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex-1 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 ml-20 pt-20 p-6 flex">
        {/* Sidebar des sections */}
        <div className="w-80 pr-6">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-4 sticky top-6">
            <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center">
              <Settings className="mr-2" size={24} />
              Configuration
            </h2>
            
            <nav className="space-y-2">
              {configSections.map((section) => {
                const IconComponent = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center space-x-3 ${
                      activeSection === section.id
                        ? `bg-gradient-to-r ${section.color} text-white shadow-lg`
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <IconComponent size={20} />
                    <span className="font-medium">{section.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1">
          <div className="max-w-4xl">
            {activeSection === 'admins' && renderAdminSection()}
            {activeSection === 'notifications' && renderPlaceholderSection('Notifications')}
            {activeSection === 'appearance' && renderPlaceholderSection('Apparence')}
            {activeSection === 'general' && renderPlaceholderSection('Général')}
          </div>
        </div>
      </div>
      
      <Popup message={popup.message} type={popup.type} onClose={closePopup} />
    </>
  );
};

export default ConfigurationPage;