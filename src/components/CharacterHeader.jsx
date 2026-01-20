import React, { useState } from "react";
import { ChevronUp, ChevronDown, Minus, Plus, Trash2 } from "lucide-react";
import { createPortal } from "react-dom";
import AlertConfirmation from "./AlertConfirmation";
import personnageService from "../services/personnageService.js";
import { useNavigate } from "react-router-dom";

const FALLBACK_SVG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
     <rect width="64" height="64" fill="transparent"/>
     <text x="50%" y="55%" font-size="36" text-anchor="middle" dominant-baseline="middle" fill="#FB923C">?</text>
   </svg>`
);
const CharacterHeader = ({
                             character,
                             editMode,
                             onFieldChange,
                             onImageClick,
                             imageWrapperRef
                         }) => {
    const navigate = useNavigate();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    const handleLevelChange = (delta) => {
        const newLevel = Math.max(1, (character.level || 1) + delta);
        onFieldChange("level", newLevel);
    };

    const handleDeleteCharacter = async () => {
        try {
            await personnageService.deletePersonnage(character.id);
            // Redirection vers la page du serveur après suppression
            // On utilise window.location pour forcer un rechargement complet et éviter les problèmes de cache
            window.location.href = `/dashboard/server/${character.idServer}`;
        } catch (error) {
            console.error("Erreur lors de la suppression du personnage:", error);
            alert("Erreur lors de la suppression du personnage");
        }
    };

    return (
        <div className="relative p-8 bg-gradient-to-r from-orange-500/20 to-red-500/20">
            {/* Bouton de suppression en mode édition */}
            {editMode && (
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="absolute bottom-4 right-4 p-3 bg-gray-900/90 backdrop-blur-sm border border-red-500/50 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-200 z-20 shadow-lg hover:shadow-red-500/20 flex items-center gap-2 group"
                    title="Supprimer le personnage"
                >
                    <Trash2 size={20} />
                    <span className="font-bold text-sm hidden group-hover:inline">Supprimer</span>
                </button>
            )}

            <div className="flex items-start space-x-6">
                {/* IMAGE WRAPPER */}
                <div
                    ref={imageWrapperRef}
                    className="relative group w-32 h-32 cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        onImageClick();
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onImageClick();
                        }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={editMode ? "Modifier l'image du personnage" : "Voir l'image en grand"}
                >
                    <img
                        src={character.image || FALLBACK_SVG}
                        alt={`${character.prenom} ${character.nom}`}
                        className="w-32 h-32 rounded-2xl object-cover border-4 shadow-2x object-top"
                        onError={(e) => {
                            e.target.onerror = null;          // évite boucle si fallback aussi foire
                            e.target.src = FALLBACK_SVG;
                        }}
                    />

                    {/* Overlay "modifier" ou "voir" */}
                    <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition pointer-events-none">
                        <span className="text-white font-bold">{editMode ? "Modifier" : "Agrandir"}</span>
                    </div>
                </div>

                {/* Infos personnage */}
                <div className="flex-1">
                    {editMode ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex space-x-4">
                                <input
                                    value={character.prenom || ""}
                                    onChange={(e) => onFieldChange("prenom", e.target.value)}
                                    className="text-4xl font-bold bg-gray-800 border border-gray-700 px-3 py-1 rounded-lg text-orange-400 w-1/2"
                                    placeholder="Prénom"
                                />
                                <input
                                    value={character.nom || ""}
                                    onChange={(e) => onFieldChange("nom", e.target.value)}
                                    className="text-4xl font-bold bg-gray-800 border border-gray-700 px-3 py-1 rounded-lg text-orange-400 w-1/2"
                                    placeholder="Nom"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    value={character.classe || ""}
                                    onChange={(e) => onFieldChange("classe", e.target.value)}
                                    className="bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg text-white placeholder-gray-500"
                                    placeholder="Classe"
                                />
                                <input
                                    value={character.race || ""}
                                    onChange={(e) => onFieldChange("race", e.target.value)}
                                    className="bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg text-white placeholder-gray-500"
                                    placeholder="Race"
                                />
                                <input
                                    value={character.historique || ""}
                                    onChange={(e) => onFieldChange("historique", e.target.value)}
                                    className="bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg text-white placeholder-gray-500"
                                    placeholder="Historique"
                                />
                                <input
                                    value={character.alignement || ""}
                                    onChange={(e) => onFieldChange("alignement", e.target.value)}
                                    className="bg-gray-800 border border-gray-700 px-3 py-2 rounded-lg text-white placeholder-gray-500"
                                    placeholder="Alignement"
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-2">
                                {character.prenom} {character.nom || ""}
                            </h1>
                            <div className="text-gray-300 text-lg mb-2 flex flex-wrap gap-2">
                                {character.race && <span>{character.race}</span>}
                                {character.classe && <span>• {character.classe}</span>}
                                {character.historique && <span>• {character.historique}</span>}
                                {character.alignement && <span>• {character.alignement}</span>}
                            </div>
                        </>
                    )}

                    <div className="flex items-center space-x-6 mb-4 mt-4">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-center min-w-[150px]">
                            {editMode ? (
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-center gap-2">
                                        <button 
                                            onClick={() => handleLevelChange(-1)}
                                            className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-medium opacity-80">Niveau</span>
                                            <input
                                                type="number"
                                                value={character.level}
                                                onChange={(e) => onFieldChange("level", Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-12 bg-transparent border-b border-white/30 text-center text-white font-bold text-lg focus:outline-none focus:border-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                        </div>
                                        <button 
                                            onClick={() => handleLevelChange(1)}
                                            className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 border-t border-white/20 pt-1">
                                        <input
                                            type="number"
                                            value={character.experience}
                                            onChange={(e) => onFieldChange("experience", parseInt(e.target.value) || 0)}
                                            className="w-16 bg-transparent border-b border-white/30 text-center text-white text-sm focus:outline-none focus:border-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <span className="text-xs opacity-80">XP</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="text-lg font-medium">Niveau {character.level}</div>
                                    <div className="text-sm opacity-80">{character.experience} XP</div>
                                </>
                            )}
                        </div>

                        <span className="text-orange-400 font-bold text-2xl">
                            ⚡ {character.power}
                        </span>
                    </div>
                </div>
            </div>

            {createPortal(
                <AlertConfirmation
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={handleDeleteCharacter}
                    title="Supprimer le personnage"
                    message={`Êtes-vous sûr de vouloir supprimer définitivement ce personnage ? Cette action est irréversible.`}
                    type="danger"
                />,
                document.body
            )}
        </div>
    );
};

export default CharacterHeader;