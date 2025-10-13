import React from "react";

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
    return (
        <div className="relative p-8 bg-gradient-to-r from-orange-500/20 to-red-500/20">
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
                        <div className="flex space-x-4 mb-2">
                            <input
                                value={character.prenom}
                                onChange={(e) => onFieldChange("prenom", e.target.value)}
                                className="text-4xl font-bold bg-gray-800 border border-gray-700 px-3 py-1 rounded-lg text-orange-400"
                            />
                            <input
                                value={character.nom}
                                onChange={(e) => onFieldChange("nom", e.target.value)}
                                className="text-4xl font-bold bg-gray-800 border border-gray-700 px-3 py-1 rounded-lg text-orange-400"
                            />
                        </div>
                    ) : (
                        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-2">
                            {character.prenom} {character.nom}
                        </h1>
                    )}

                    <div className="flex items-center space-x-6 mb-4 mt-4">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-center">
                            <div className="text-lg font-medium">Niveau {character.level}</div>
                            <div className="text-sm opacity-80">{character.experience} XP</div>
                        </div>

                        <span className="text-orange-400 font-bold text-2xl">
                            ⚡ {character.power}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharacterHeader;