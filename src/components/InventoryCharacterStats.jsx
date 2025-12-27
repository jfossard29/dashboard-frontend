import React from 'react';

const InventoryCharacterStats = ({ 
    character, 
    inventoryData, 
    editMode, 
    handleStatChange, 
    totalStats 
}) => {
    return (
        <div className="w-64 space-y-4">
            <div className="bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-xl p-6 border-2 border-orange-500/50">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-6xl mb-4 shadow-lg shadow-orange-500/50 overflow-hidden">
                    {character?.image ? (
                        <img src={character.image} alt={character.prenom} className="w-full h-full object-cover object-top" />
                    ) : (
                        <span>👤</span>
                    )}
                </div>
                <h2 className="text-2xl font-bold text-center text-orange-400 mb-1">{inventoryData.prenom}</h2>
                <p className="text-center text-gray-400">Niv. {inventoryData.niveau} • {inventoryData.classe}</p>
            </div>

            <div className="space-y-2">
                <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600/50">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-red-400 font-semibold">❤️ Vie</span>
                        <span className="text-white font-bold">{inventoryData.vie}/{inventoryData.vieMax}</span>
                    </div>
                    <div className="h-3 bg-gray-900 rounded-full overflow-hidden border border-gray-800 mb-2">
                        <div
                            className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500 shadow-lg shadow-red-500/50"
                            style={{ width: `${(inventoryData.vie / inventoryData.vieMax) * 100}%` }}
                        ></div>
                    </div>
                    {editMode && (
                        <div className="mt-1 space-y-1">
                            <div className="flex justify-between gap-1">
                                <button onClick={() => handleStatChange('vie', inventoryData.vie - 10)} className="flex-1 px-0 py-1 bg-red-900/50 hover:bg-red-800 text-red-200 text-xs font-bold rounded">-10</button>
                                <button onClick={() => handleStatChange('vie', inventoryData.vie - 1)} className="flex-1 px-0 py-1 bg-red-900/50 hover:bg-red-800 text-red-200 text-xs font-bold rounded">-1</button>
                                <input 
                                    type="number" 
                                    value={inventoryData.vie} 
                                    onChange={(e) => handleStatChange('vie', parseInt(e.target.value) || 0)}
                                    className="w-12 bg-gray-800 border border-gray-600 text-white text-xs font-bold text-center rounded p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button onClick={() => handleStatChange('vie', inventoryData.vie + 1)} className="flex-1 px-0 py-1 bg-green-900/50 hover:bg-green-800 text-green-200 text-xs font-bold rounded">+1</button>
                                <button onClick={() => handleStatChange('vie', inventoryData.vie + 10)} className="flex-1 px-0 py-1 bg-green-900/50 hover:bg-green-800 text-green-200 text-xs font-bold rounded">+10</button>
                            </div>
                            {inventoryData.vieMax > 100 && (
                                <div className="flex justify-between gap-1">
                                    <button onClick={() => handleStatChange('vie', inventoryData.vie - 100)} className="flex-1 py-1 bg-red-900/50 hover:bg-red-800 text-red-200 text-xs font-bold rounded">-100</button>
                                    <button onClick={() => handleStatChange('vie', inventoryData.vie + 100)} className="flex-1 py-1 bg-green-900/50 hover:bg-green-800 text-green-200 text-xs font-bold rounded">+100</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600/50">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-blue-400 font-semibold">⚡ Mana</span>
                        <span className="text-white font-bold">{inventoryData.mana}/{inventoryData.manaMax}</span>
                    </div>
                    <div className="h-3 bg-gray-900 rounded-full overflow-hidden border border-gray-800 mb-2">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 shadow-lg shadow-blue-500/50"
                            style={{ width: `${(inventoryData.mana / inventoryData.manaMax) * 100}%` }}
                        ></div>
                    </div>
                    {editMode && (
                        <div className="mt-1 space-y-1">
                            <div className="flex justify-between gap-1">
                                <button onClick={() => handleStatChange('mana', inventoryData.mana - 10)} className="flex-1 px-0 py-1 bg-blue-900/50 hover:bg-blue-800 text-blue-200 text-xs font-bold rounded">-10</button>
                                <button onClick={() => handleStatChange('mana', inventoryData.mana - 1)} className="flex-1 px-0 py-1 bg-blue-900/50 hover:bg-blue-800 text-blue-200 text-xs font-bold rounded">-1</button>
                                <input 
                                    type="number" 
                                    value={inventoryData.mana} 
                                    onChange={(e) => handleStatChange('mana', parseInt(e.target.value) || 0)}
                                    className="w-12 bg-gray-800 border border-gray-600 text-white text-xs font-bold text-center rounded p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button onClick={() => handleStatChange('mana', inventoryData.mana + 1)} className="flex-1 px-0 py-1 bg-green-900/50 hover:bg-green-800 text-green-200 text-xs font-bold rounded">+1</button>
                                <button onClick={() => handleStatChange('mana', inventoryData.mana + 10)} className="flex-1 px-0 py-1 bg-green-900/50 hover:bg-green-800 text-green-200 text-xs font-bold rounded">+10</button>
                            </div>
                            {inventoryData.manaMax > 100 && (
                                <div className="flex justify-between gap-1">
                                    <button onClick={() => handleStatChange('mana', inventoryData.mana - 100)} className="flex-1 py-1 bg-blue-900/50 hover:bg-blue-800 text-blue-200 text-xs font-bold rounded">-100</button>
                                    <button onClick={() => handleStatChange('mana', inventoryData.mana + 100)} className="flex-1 py-1 bg-green-900/50 hover:bg-green-800 text-green-200 text-xs font-bold rounded">+100</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                <h4 className="text-orange-400 font-bold text-sm mb-3 uppercase tracking-wider">Stats totales</h4>
                <div className="space-y-2 text-sm max-h-60 overflow-y-auto scrollbar-custom">
                    {Object.entries(totalStats).length > 0 ? (
                        Object.entries(totalStats).map(([stat, value]) => (
                            <div key={stat} className="flex justify-between">
                                <span className="text-gray-400">{stat}</span>
                                <span className="text-green-400 font-bold">+{value}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-500 text-center italic">Aucun équipement</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InventoryCharacterStats;