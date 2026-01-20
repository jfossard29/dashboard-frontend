import { fetchAPI } from './api';

const ressourceDndService = {
    /**
     * Récupère toutes les ressources d'un personnage
     */
    getRessourcesByPersonnage: async (personnageId) => {
        return fetchAPI(`/ressource-dnd/personnage/${personnageId}`);
    },

    /**
     * Crée une nouvelle ressource pour un personnage
     */
    createRessource: async (ressourceData) => {
        return fetchAPI('/ressource-dnd', {
            method: 'POST',
            body: JSON.stringify(ressourceData),
        });
    },

    /**
     * Met à jour une ressource existante
     */
    updateRessource: async (ressourceId, changes) => {
        return fetchAPI(`/ressource-dnd/${ressourceId}`, {
            method: 'PUT',
            body: JSON.stringify(changes),
        });
    },

    /**
     * Supprime une ressource
     */
    deleteRessource: async (ressourceId) => {
        return fetchAPI(`/ressource-dnd/${ressourceId}`, {
            method: 'DELETE',
        });
    }
};

export default ressourceDndService;