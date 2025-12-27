import { fetchAPI } from './api';

const equipementService = {
    /**
     * Met à jour l'équipement d'un personnage
     */
    updateEquipement: async (personnageId, equipementData) => {
        return fetchAPI(`/equipement/personnage/${personnageId}`, {
            method: 'PUT',
            body: JSON.stringify(equipementData),
        });
    },

    /**
     * Ajoute un slot d'équipement personnalisé
     */
    addSlot: async (personnageId, slotName) => {
        return fetchAPI(`/equipement/personnage/${personnageId}/slot`, {
            method: 'POST',
            body: JSON.stringify({ slotName }),
        });
    },

    /**
     * Supprime un slot d'équipement personnalisé
     */
    removeSlot: async (personnageId, slotName) => {
        return fetchAPI(`/equipement/personnage/${personnageId}/slot`, {
            method: 'DELETE',
            body: JSON.stringify({ slotName }),
        });
    }
};

export default equipementService;