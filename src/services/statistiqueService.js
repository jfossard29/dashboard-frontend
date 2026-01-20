import { fetchAPI } from './api';

const statistiqueService = {
    /**
     * Récupère les statistiques globales (nombre de personnages, utilisateurs, serveurs)
     * @returns {Promise<Object>} Les statistiques
     */
    getGlobalStats: async () => {
        return fetchAPI('/archivist-statistiques');
    }
};

export default statistiqueService;