import React from "react";
import { Trash2, Plus, AlignLeft, List } from "lucide-react";
import TypeDropdown from "./TypeDropdown.jsx";

const CharacterSection = ({
                              section,
                              editMode,
                              onContentChange,
                              onIconClick,
                              onNameChange,
                              onTypeChange,
                              onRemove,
                              onListItemAdd,
                              onListItemChange,
                              onListItemRemove,
                              renderIcon
                          }) => {
    
    // Options pour le dropdown de type de section
    const sectionTypeOptions = [
        { value: "DESCRIPTION", label: "Description" },
        { value: "LISTE", label: "Liste" }
    ];

    return (
        <div className="bg-gray-800/40 p-6 rounded-xl border border-gray-700/30 relative">
            <div className="flex items-center mb-4 gap-3">
                {editMode && !section.obligatoire ? (
                    <>
                        <button
                            onClick={onIconClick}
                            className="hover:scale-110 transition-transform cursor-pointer bg-gray-700/50 hover:bg-orange-500/20 rounded-lg p-2 border-2 border-dashed border-gray-600 hover:border-orange-400 flex items-center justify-center w-12 h-12 flex-shrink-0 overflow-hidden"
                            title="Cliquez pour changer l'emoji"
                            type="button"
                        >
                            {renderIcon(section.icone)}
                        </button>
                        <input
                            type="text"
                            value={section.titre} // Valeur gérée par React via l'état
                            onBlur={(e) => {
                                const newName = e.target.value.trim(); // Validation après édition
                                if (newName && newName !== section.titre) {
                                    onNameChange(section.id, newName);
                                }
                            }}
                            onChange={(e) => {
                                const newName = e.target.value;
                                onNameChange(section.id, newName); // Mise à jour pendant la saisie
                            }}
                            className="text-xl font-semibold bg-gray-700 border border-gray-600 px-3 py-1 rounded-lg text-gray-200 flex-1 min-w-0"
                        />
                        <div className="w-48">
                            <TypeDropdown 
                                value={section.type} 
                                onChange={(newType) => onTypeChange(section.id, newType)}
                                options={sectionTypeOptions}
                                label="Type"
                                colors={{
                                    bg: 'from-gray-700 to-gray-800',
                                    border: 'border-gray-600',
                                    borderFocus: 'border-gray-500',
                                    textColor: 'text-gray-300'
                                }}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center justify-center w-12 h-12 flex-shrink-0 overflow-hidden">
                            {renderIcon(section.icone)}
                        </div>
                        <h2 className="text-xl font-semibold text-gray-200">{section.titre}</h2>
                    </>
                )}
            </div>

            {/* Contenu selon le type */}
            {section.type === "DESCRIPTION" ? (
                editMode ? (
                    <textarea
                        value={section.contenu}
                        onChange={(e) => onContentChange(section.id, e.target.value)}
                        className="w-full bg-gray-700 text-white rounded px-3 py-2 min-h-[100px]"
                    />
                ) : (
                    <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                        {section.contenu}
                    </p>
                )
            ) : (
                // Type Liste
                <div className="space-y-3">
                    {editMode ? (
                        <>
                            {(section.contenu || []).map((item) => (
                                <div key={item.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                                    <div className="flex gap-3 mb-2">
                                        <input
                                            type="text"
                                            value={item.titre}
                                            onChange={(e) =>
                                                onListItemChange(section.id, item.id, { ...item, titre: e.target.value })
                                            }
                                            placeholder="Nom de l'élément"
                                            className="flex-1 bg-gray-700 border border-gray-600 px-3 py-1 rounded text-white"
                                        />

                                        <button
                                            onClick={() => onListItemRemove(section.id, item.id)}
                                            className="text-red-400 hover:text-red-600"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <textarea
                                        value={item.contenu}
                                        onChange={(e) =>
                                            onListItemChange(section.id, item.id, { ...item, contenu: e.target.value })
                                        }
                                        placeholder="Description"
                                        className="w-full bg-gray-700 border border-gray-600 px-3 py-1 rounded text-white"
                                        rows="2"
                                    />

                                </div>
                            ))}
                            <button
                                onClick={() => onListItemAdd(section.id)}
                                className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-600"
                            >
                                <Plus size={18} />
                                <span>Ajouter un élément</span>
                            </button>
                        </>
                    ) : (
                        <div className="space-y-3">
                            {(section.contenu || []).map((item) => (
                                <div key={item.id} className="bg-gray-700/30 p-4 rounded-lg">
                                    <h3 className="text-orange-400 font-semibold mb-1">{item.titre}</h3>
                                    <p className="text-gray-300">{item.contenu}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {editMode && !section.obligatoire && (
                <button
                    onClick={() => onRemove(section.id)}
                    className="mt-3 text-red-400 hover:text-red-600 flex items-center space-x-2"
                >
                    <Trash2 size={18} />
                    <span>Supprimer cette rubrique</span>
                </button>
            )}
        </div>
    );
};

export default CharacterSection;