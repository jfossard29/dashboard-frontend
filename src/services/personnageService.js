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
     * Récupère les données D&D d'un personnage par ID
     */
    getPersonnageData: async (personnageId) => {
        return fetchAPI(`/personnage/data/${personnageId}`);
    },

    /**
     * Met à jour les données D&D d'un personnage (Obsolète si on utilise les endpoints spécifiques)
     */
    updatePersonnageData: async (personnageId, data) => {
        return fetchAPI(`/personnage/data/${personnageId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Met à jour les statistiques d'un personnage
     */
    updateStatistiques: async (id, changes) => {
        return fetchAPI(`/statistiques/${id}`, {
            method: 'PUT',
            body: JSON.stringify(changes),
        });
    },

    /**
     * Met à jour les compétences d'un personnage
     */
    updateStatistiqueCompetence: async (id, changes) => {
        return fetchAPI(`/statistique-competence/${id}`, {
            method: 'PUT',
            body: JSON.stringify(changes),
        });
    },

    /**
     * Met à jour la monnaie d'un personnage
     */
    updateMonnaie: async (id, changes) => {
        return fetchAPI(`/monnaie/${id}`, {
            method: 'PUT',
            body: JSON.stringify(changes),
        });
    },

    /**
     * Met à jour un personnage (champs racine comme histoire, rubriques, image, inventaire)
     */
    updatePersonnage: async (personnageId, changes) => {
        return fetchAPI(`/personnage/${personnageId}`, {
            method: 'PUT',
            body: JSON.stringify(changes),
        });
    },

    /**
     * Met à jour les infos de base d'un personnage (prenom, nom, classe, stats, etc.)
     */
    updateInfosPersonnage: async (personnageId, changes) => {
        return fetchAPI(`/infos-personnage/${personnageId}`, {
            method: 'PUT',
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

    /**
     * Supprime un personnage
     */
    deletePersonnage: async (personnageId) => {
        return fetchAPI(`/personnage/${personnageId}`, {
            method: 'DELETE',
        });
    },
};

export default personnageService;