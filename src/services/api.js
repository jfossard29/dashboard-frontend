// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8081';
const INVENTORY_API_URL = import.meta.env.VITE_INVENTORY_API_URL || 'http://localhost:8082';

/**
 * Fonction générique pour les appels API
 */
const fetchAPI = async (endpoint, options = {}) => {
    let baseUrl = API_URL;
    if (options.useAuthApi) {
        baseUrl = AUTH_API_URL;
    } else if (options.useInventoryApi) {
        baseUrl = INVENTORY_API_URL;
    }
    
    // On retire les options spécifiques de notre wrapper
    const { useAuthApi, useInventoryApi, ...fetchOptions } = options;

    const config = {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
        },
        ...fetchOptions,
    };

    try {
        const response = await fetch(`${baseUrl}${endpoint}`, config);

        if (!response.ok) {
            const error = await response.json().catch(() => null);
            throw new Error(error?.message || `HTTP Error ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API Error [${baseUrl}${endpoint}]:`, error);
        throw error;
    }
};

export { API_URL, AUTH_API_URL, INVENTORY_API_URL, fetchAPI };