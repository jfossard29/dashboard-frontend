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
            method: 'PUT', // Changed from PATCH to PUT as a workaround for potential CORS issues
            body: JSON.stringify(changes),
        });
    },

    /**
     * Récupère la liste des personnages d'un serveur
     */
    getPersonnageListe: async (serverId) => {
        return fetchAPI(`/personnage/liste/${serverId}`);
    },

    /**
     * Crée un nouveau personnage
     */
    createPersonnage: async (payload) => {
        return fetchAPI(`/personnage`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },
};

export default personnageService;