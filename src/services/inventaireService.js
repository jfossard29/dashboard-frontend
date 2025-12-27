import { fetchAPI } from './api';

const inventaireService = {
    /**
     * Ajoute un objet à l'inventaire
     */
    addItem: async (itemData) => {
        return fetchAPI('/inventaire', {
            method: 'POST',
            body: JSON.stringify(itemData),
        });
    },

    /**
     * Supprime un objet de l'inventaire
     */
    deleteItem: async (itemId, isPrivate) => {
        const url = isPrivate 
            ? `/objet/${itemId}`
            : `/inventaire/${itemId}`;
        
        return fetchAPI(url, {
            method: 'DELETE',
        });
    },

    /**
     * Met à jour un objet (privé)
     */
    updateItem: async (itemId, itemData) => {
        return fetchAPI(`/objet/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify(itemData),
        });
    }
};

export default inventaireService;