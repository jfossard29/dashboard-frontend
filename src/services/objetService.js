// src/services/itemService.js
import { fetchAPI } from './api';

const objetService = {
    /**
     * Récupère tous les objets d'un serveur
     */
    getObjets: async (serverId) => {
        return fetchAPI(`/objet/liste/${serverId}`);
    },

    /**
     * Crée un nouvel objet
     */
    createObjet: async (objetData) => {
        return fetchAPI(`/objet`, {
            method: 'POST',
            body: JSON.stringify(objetData),
        });
    },

    /**
     * Met à jour un objet (envoie uniquement les changements)
     */
    updateObjet: async (objetId, changes) => {
        return fetchAPI(`/objet/${objetId}`, {
            method: 'PUT',
            body: JSON.stringify(changes),
        });
    },

    /**
     * Supprime un objet
     */
    deleteObjet: async (objetId) => {
        return fetchAPI(`/objet/${objetId}`, {
            method: 'DELETE',
        });
    },
};

export default objetService;