// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Fonction générique pour les appels API
 */
const fetchAPI = async (endpoint, options = {}) => {
    const config = {
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);

        if (!response.ok) {
            const error = await response.json().catch(() => null);
            throw new Error(error?.message || `HTTP Error ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API Error [${API_URL}${endpoint}]:`, error);
        throw error;
    }
};

export { API_URL, fetchAPI };