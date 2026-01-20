import { fetchAPI } from './api';

const equipementService = {
    /**
     * Récupère l'équipement d'un personnage
     */
    getEquipement: async (personnageId) => {
        return fetchAPI(`/equipement/personnage/${personnageId}`, {
            useInventoryApi: true
        });
    },

    /**
     * Met à jour l'équipement d'un personnage
     */
    updateEquipement: async (personnageId, equipementData) => {
        return fetchAPI(`/equipement/personnage/${personnageId}`, {
            method: 'PUT',
            body: JSON.stringify(equipementData),
            useInventoryApi: true
        });
    },

    /**
     * Ajoute un slot d'équipement personnalisé
     */
    addSlot: async (personnageId, slotName) => {
        return fetchAPI(`/equipement/personnage/${personnageId}/slot`, {
            method: 'POST',
            body: JSON.stringify({ slotName }),
            useInventoryApi: true
        });
    },

    /**
     * Supprime un slot d'équipement personnalisé
     */
    removeSlot: async (personnageId, slotName) => {
        return fetchAPI(`/equipement/personnage/${personnageId}/slot`, {
            method: 'DELETE',
            body: JSON.stringify({ slotName }),
            useInventoryApi: true
        });
    }
};

export default equipementService;