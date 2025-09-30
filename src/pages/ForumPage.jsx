import React, { useState, useEffect } from "react";
import { Search, Star } from "lucide-react";
import '../Scrollbar.css';

const ForumPage = ({ idServeur, onSelectCharacter }) => {
  const [characters, setCharacters] = useState([]);
  const [copiedCreator, setCopiedCreator] = useState(null);

  // Fonction pour récupérer les personnages
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch(`http://localhost:8080/personnage/liste/${idServeur}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des personnages");
        }
        const data = await response.json();
        // Transformez les données si nécessaire
        const formattedCharacters = data.body.map((character) => ({
          id: character.id,
          name: `${character.prenom} ${character.nom}`,
          image: character.image,
          summary: character.resume,
          level: character.niveau || 1, // Ajoutez un niveau par défaut si non fourni
          power: character.puissance || 0, // Ajoutez une puissance par défaut si non fournie
          userAvatar: character.userAvatar || "https://example.com/default-avatar.jpg",
          creatorName: character.idUtilisateur,
        }));
        setCharacters(formattedCharacters);
      } catch (error) {
        console.error("Erreur :", error);
      }
    };

    fetchCharacters();
  }, [idServeur]);

  const copyCreatorName = async (e, creatorName) => {
    e.stopPropagation(); // Empêcher la propagation vers le clic du personnage

    try {
      await navigator.clipboard.writeText(creatorName || "Créateur");
      setCopiedCreator(creatorName);

      // Réinitialiser après 2 secondes
      setTimeout(() => {
        setCopiedCreator(null);
      }, 2000);
    } catch (err) {
      console.error("Erreur lors de la copie:", err);
      // Fallback pour les navigateurs qui ne supportent pas clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = creatorName || "Créateur";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      setCopiedCreator(creatorName);
      setTimeout(() => {
        setCopiedCreator(null);
      }, 2000);
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 ml-20 h-screen flex flex-col pt-20">
      {/* Header fixe */}
      <div className="flex-shrink-0 p-6 pb-0">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-2">
            Personnages
          </h1>
          <p className="text-gray-400">Gérez vos personnages et découvrez leurs histoires</p>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un personnage..."
            className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-white placeholder-gray-400 transition-all duration-200"
          />
        </div>
      </div>

      {/* Zone scrollable avec scrollbar personnalisée */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-2">
          {characters.map((character) => (
            <div
              key={character.id}
              onClick={() => onSelectCharacter(character)}
              className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300 cursor-pointer group hover:shadow-2xl shadow-lg hover:-translate-y-1"
            >
              <div className="relative mb-4">
                <img
                  src={character.image}
                  alt={character.name}
                  className="w-24 h-24 rounded-2xl object-cover border-3 border-gradient-to-r from-orange-400 to-red-500 shadow-lg mb-4"
                />
                <div className="absolute -top-2 -right-2 group/creator">
                  <img
                    src={character.userAvatar}
                    alt="Créateur"
                    className="w-10 h-10 rounded-full object-cover border-3 border-gray-600 hover:border-orange-400 transition-colors duration-200 shadow-lg cursor-pointer"
                    onClick={(e) => copyCreatorName(e, character.creatorName)}
                  />
                  <div
                    className={`absolute top-1/2 right-12 transform -translate-y-1/2 px-3 py-2 rounded-lg opacity-0 group-hover/creator:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[9999] shadow-lg ${
                      copiedCreator === character.creatorName
                        ? "bg-green-600 text-white"
                        : "bg-gray-800 text-white"
                    }`}
                  >
                    {copiedCreator === character.creatorName
                      ? "Pseudo copié"
                      : `@${character.creatorName || "Créateur"}`}
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors duration-200 mb-2">
                  {character.name}
                </h3>
                <div className="flex items-center space-x-4 mb-3">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Niv. {character.level}
                  </span>
                  <span className="text-orange-400 font-bold">⚡ {character.power.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">{character.summary}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-yellow-400">
                  <Star size={16} className="mr-1 fill-current" />
                  <span className="text-sm">Favori</span>
                </div>
                <span className="text-gray-500 text-xs">Cliquer pour détails</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForumPage;