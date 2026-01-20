import { fetchAPI } from './api';

const loginService = {

    getLogin: async () => {
        return fetchAPI(`/auth/discord/url`, { useAuthApi: true });
    },

    getAuthCallback: async (code) => {
        return fetchAPI(`/auth/callback?code=${code}`, { useAuthApi: true });
    },

    checkAuth: async () => {
        return fetchAPI(`/auth/check`, { useAuthApi: true });
    },
    
    logout: async () => {
        return fetchAPI(`/auth/logout`, { useAuthApi: true, method: 'POST' });
    }

}

export default loginService;