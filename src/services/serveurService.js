// src/services/guildService.js
import { fetchAPI } from './api';

const guildService = {
    /**
     * Récupère les membres d'un serveur
     */
    getGuildMembers: async (serverId) => {
        return fetchAPI(`/guilds/${serverId}/members`, { useAuthApi: true });
    },

    /**
     * Récupère les infos d'un serveur
     */
    getGuildInfo: async (serverId) => {
        return fetchAPI(`/api/server/${serverId}`, { useAuthApi: true });
    },
};

export default guildService;