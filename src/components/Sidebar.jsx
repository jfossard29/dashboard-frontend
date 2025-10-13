import React from "react";
import { Plus, Home } from "lucide-react";

const Sidebar = ({ username, avatar, servers, selectedServer, onSelectServer, onSetCurrentPage }) => (
    <div className="w-20 bg-gradient-to-b from-gray-900 to-black fixed left-0 top-0 h-full z-10 flex flex-col">
        {/* Zone fixe - Avatar utilisateur + Accueil global */}
        <div className="flex-shrink-0 flex flex-col items-center py-4">
            <img
                src={avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                alt={username}
                className="w-12 h-12 rounded-full border-2 border-orange-500 shadow-lg cursor-pointer hover:border-orange-400 transition-colors"
                title={username}
            />

            {/* Bouton Accueil Global */}
            <div
                onClick={() => onSelectServer(null)}
                className={`mt-4 w-12 h-12 rounded-2xl hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-110 relative group ${
                    selectedServer === null
                        ? 'bg-gradient-to-r from-orange-400 to-red-500'
                        : 'bg-gray-700 hover:bg-gray-600'
                }`}
            >
                <Home size={24} className={selectedServer === null ? 'text-white' : 'text-gray-400'} />
                <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                    Accueil
                </div>
            </div>

            <div className="w-8 h-0.5 bg-gray-600 rounded mt-4"></div>
        </div>

        {/* Zone scrollable - Liste des serveurs */}
        <div className="flex-1 overflow-y-auto px-2 py-2" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            <div className="space-y-4 flex flex-col items-center">
                {servers && servers.map((server) => (
                    <div key={server.id} className="relative group">
                        <div
                            onClick={() => {
                                onSelectServer(server);
                                onSetCurrentPage("home");
                            }}
                            className={`w-12 h-12 rounded-2xl hover:rounded-xl transition-all duration-200 flex items-center justify-center text-white text-xl cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-110 ${
                                selectedServer?.id === server.id
                                    ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-gray-900'
                                    : ''
                            }`}
                        >
                            {server.icon? (
                                <img src={server.icon} alt={server.name} className="w-full h-full rounded-2xl object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center">
                                    {server.name?.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                            {server.name}
                        </div>
                        {/* Indicateur de sélection */}
                        {selectedServer?.id === server.id && (
                            <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-r"></div>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* Zone fixe - Bouton ajouter serveur */}
        <div className="flex-shrink-0 flex flex-col items-center py-4">
            <div className="w-12 h-12 bg-gray-700 hover:bg-gradient-to-r hover:from-green-400 hover:to-green-500 rounded-2xl hover:rounded-xl transition-all duration-200 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer shadow-lg group relative">
                <Plus size={24} />
                <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                    Ajouter un serveur
                </div>
            </div>
        </div>
    </div>
);

export default Sidebar;