import { fetchAPI } from './api';

const loginService = {

    getLogin: async () => {
        return fetchAPI(`/auth/discord/url`);
    },

    getAuthCallback: async (code) => {
        return fetchAPI(`/auth/callback?code=${code}`);
    },

    checkAuth: async () => {
        return fetchAPI(`/auth/check`);
    }

}

export default loginService;