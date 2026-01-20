import { fetchAPI } from './api';

const inventaireService = {
    /**
     * Récupère l'inventaire d'un personnage
     */
    getInventaire: async (personnageId) => {
        return fetchAPI(`/inventaire/personnage/${personnageId}`, {
            useInventoryApi: true
        });
    },

    /**
     * Ajoute un objet à l'inventaire
     */
    addItem: async (itemData) => {
        return fetchAPI('/inventaire', {
            method: 'POST',
            body: JSON.stringify(itemData),
            useInventoryApi: true
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
            useInventoryApi: true
        });
    },

    /**
     * Met à jour un objet (privé)
     */
    updateItem: async (itemId, itemData) => {
        return fetchAPI(`/objet/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify(itemData),
            useInventoryApi: true
        });
    }
};

export default inventaireService;