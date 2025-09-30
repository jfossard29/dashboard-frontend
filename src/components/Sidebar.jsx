import React from "react";
import { Plus } from "lucide-react";

 const Sidebar = ({ servers }) => (
    <div className="w-20 bg-gradient-to-b from-gray-900 to-black fixed left-0 top-0 h-full z-10 flex flex-col">
      {/* Zone fixe - Avatar utilisateur */}
      <div className="flex-shrink-0 flex flex-col items-center py-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
          U
        </div>
        <div className="w-8 h-0.5 bg-gray-600 rounded mt-4"></div>
      </div>
      
      {/* Zone scrollable - Liste des serveurs */}
      <div className="flex-1 overflow-y-auto px-2 py-2" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
        <div className="space-y-4 flex flex-col items-center">
          {servers.map((server) => (
            <div key={server.id} className="relative group">
              <div className={`w-12 h-12 ${server.color} rounded-2xl hover:rounded-xl transition-all duration-200 flex items-center justify-center text-white text-xl cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-110`}>
                {server.icon}
              </div>
              <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                {server.name}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Zone fixe - Bouton ajouter serveur */}
      <div className="flex-shrink-0 flex flex-col items-center py-4">
        <div className="w-12 h-12 bg-gray-700 hover:bg-gradient-to-r hover:from-green-400 hover:to-green-500 rounded-2xl hover:rounded-xl transition-all duration-200 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer shadow-lg">
          <Plus size={24} />
        </div>
      </div>
    </div>
  );

export default Sidebar;
