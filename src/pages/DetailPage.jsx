import React, { useState } from "react";
import { ArrowLeft, Edit2, Save, Plus, Trash2 } from "lucide-react";
import '../Scrollbar.css'

const DetailPage = ({ character, onBack, onSave }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedCharacter, setEditedCharacter] = useState(character);

  if (!character) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Aucun personnage sélectionné
      </div>
    );
  }

  const handleChange = (field, value) => {
    setEditedCharacter({ ...editedCharacter, [field]: value });
  };

  const handleSectionChange = (section, value) => {
    setEditedCharacter({
      ...editedCharacter,
      customSections: { ...editedCharacter.customSections, [section]: value },
    });
  };

  const handleAddSection = () => {
    setEditedCharacter({
      ...editedCharacter,
      customSections: { ...editedCharacter.customSections, "Nouvelle section": "" },
    });
  };

  const handleRemoveSection = (section) => {
    const updated = { ...editedCharacter.customSections };
    delete updated[section];
    setEditedCharacter({ ...editedCharacter, customSections: updated });
  };

  const saveChanges = () => {
    if (onSave) onSave(editedCharacter);
    setEditMode(false);
  };

  return (
    <div className="flex-1 h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 ml-20 pt-20 overflow-hidden">
      {/* Header avec retour + actions */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft size={20} />
          <span>Retour</span>
        </button>

        {editMode ? (
          <button
            onClick={saveChanges}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
          >
            <Save size={18} />
            <span>Sauvegarder</span>
          </button>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow"
          >
            <Edit2 size={18} />
            <span>Éditer</span>
          </button>
        )}
      </div>

      {/* Bloc principal scrollable */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 rounded-2xl border border-gray-700/50 shadow-xl overflow-y-auto scrollbar-custom max-h-[calc(100vh-8rem)]">
        <div className="flex items-center space-x-6 mb-6">
          <img
            src={editedCharacter.image}
            alt={editedCharacter.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-orange-400 shadow-lg"
          />
          <div>
            {editMode ? (
              <input
                value={editedCharacter.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="text-2xl font-bold text-white bg-gray-800 border border-gray-700 px-3 py-1 rounded-lg"
              />
            ) : (
              <h2 className="text-2xl font-bold text-white">{editedCharacter.name}</h2>
            )}
            <p className="text-gray-400">Niveau {editedCharacter.level}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800/50 p-4 rounded-xl">
            <span className="text-gray-400">Niveau</span>
            {editMode ? (
              <input
                type="number"
                value={editedCharacter.level}
                onChange={(e) => handleChange("level", e.target.value)}
                className="w-full bg-gray-700 text-white rounded px-2 py-1 mt-1"
              />
            ) : (
              <p className="text-xl font-bold text-white">{editedCharacter.level}</p>
            )}
          </div>
          <div className="bg-gray-800/50 p-4 rounded-xl">
            <span className="text-gray-400">Puissance</span>
            {editMode ? (
              <input
                type="number"
                value={editedCharacter.power}
                onChange={(e) => handleChange("power", e.target.value)}
                className="w-full bg-gray-700 text-white rounded px-2 py-1 mt-1"
              />
            ) : (
              <p className="text-xl font-bold text-orange-400">
                ⚡ {editedCharacter.power.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Histoire */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Histoire</h3>
          {editMode ? (
            <textarea
              value={editedCharacter.story}
              onChange={(e) => handleChange("story", e.target.value)}
              className="w-full h-32 bg-gray-700 text-white rounded px-3 py-2"
            />
          ) : (
            <p className="text-gray-300 whitespace-pre-line">{editedCharacter.story}</p>
          )}
        </div>

        {/* Compétences */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Compétences</h3>
          {editMode ? (
            <textarea
              value={editedCharacter.abilities.join(", ")}
              onChange={(e) =>
                handleChange("abilities", e.target.value.split(",").map((a) => a.trim()))
              }
              className="w-full bg-gray-700 text-white rounded px-3 py-2"
            />
          ) : (
            <ul className="list-disc list-inside text-gray-300">
              {editedCharacter.abilities.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Sections personnalisées */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Sections personnalisées</h3>
          {Object.entries(editedCharacter.customSections || {}).map(([section, content]) => (
            <div key={section} className="mb-4">
              {editMode ? (
                <div className="flex items-center space-x-2">
                  <input
                    value={section}
                    onChange={(e) => {
                      const updated = { ...editedCharacter.customSections };
                      updated[e.target.value] = updated[section];
                      delete updated[section];
                      setEditedCharacter({ ...editedCharacter, customSections: updated });
                    }}
                    className="bg-gray-700 text-white rounded px-2 py-1"
                  />
                  <textarea
                    value={content}
                    onChange={(e) => handleSectionChange(section, e.target.value)}
                    className="flex-1 bg-gray-700 text-white rounded px-3 py-2"
                  />
                  <button
                    onClick={() => handleRemoveSection(section)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ) : (
                <>
                  <h4 className="text-md font-semibold text-orange-400">{section}</h4>
                  <p className="text-gray-300">{content}</p>
                </>
              )}
            </div>
          ))}
          {editMode && (
            <button
              onClick={handleAddSection}
              className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-600"
            >
              <Plus size={18} />
              <span>Ajouter une section</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailPage;
