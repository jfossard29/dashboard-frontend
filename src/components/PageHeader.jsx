import { Loader2, Plus } from "lucide-react";


const pages = {
    Personnage: {
        titre: "Personnages",
        description: "Gérez vos personnages et découvrez leurs histoires",
        bouton: "Nouveau Personnage",
    },
    Objet: {
        titre: "Gestion des Objets",
        description: "Gérez votre inventaire et créez de nouveaux objets",
        bouton: "Nouvel Objet",
    }
};

const PageHeader = ({
                        currentPage,
                        onButtonClick,
                        isAddingDisabled = false, // Nouveau prop pour la condition de désactivation
                        loading = false
                         }) => {
    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-2">
                    {pages[currentPage].titre}
                </h1>
                <p className="text-gray-400">
                    {pages[currentPage].description}
                </p>
            </div>

            <button
                onClick={onButtonClick}
                disabled={loading || isAddingDisabled}
                title={isAddingDisabled ? "Action non disponible pour le moment" : pages[currentPage].bouton}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                ) : (
                    <Plus size={20} />
                )}
                <span>{pages[currentPage].bouton}</span>
            </button>
        </div>
    );
};

export default PageHeader;