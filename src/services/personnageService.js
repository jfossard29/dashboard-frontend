// src/services/characterService.js
import { fetchAPI } from './api';

const personnageService = {
    /**
     * Récupère un personnage par ID
     */
    getPersonnage: async (personnageId) => {
        return fetchAPI(`/personnage/${personnageId}`);
    },

    /**
     * Met à jour un personnage
     */
    updatePersonnage: async (personnageId, changes) => {
        return fetchAPI(`/personnage/${personnageId}`, {
            method: 'PATCH',
            body: JSON.stringify(changes),
        });
    },

    /**
     * Récupère la liste des personnages d'un serveur
     */
    getPersonnageListe: async (serverId) => {
        return fetchAPI(`/personnage/liste/${serverId}`);
    },
};

export default personnageService;