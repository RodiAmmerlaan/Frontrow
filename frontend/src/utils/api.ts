import axios from 'axios';

let accessToken: string | null = null;
let tokenUpdateCallback: ((token: string | null) => void) | null = null;

export function setAccessToken(token: string | null) {
    accessToken = token;
}

export function setTokenUpdateCallback(callback: (token: string | null) => void) {
    tokenUpdateCallback = callback;
}

interface AccessToken {
    access_token: string
}

const api = axios.create({
    baseURL: "http://localhost:3000/api/v1",
    withCredentials: true
});

api.interceptors.request.use((config) => {
    if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
})

api.interceptors.response.use((response) => response, async (error) => {
    if (error.response?.status === 401 && !error.config.__isRetry) {
        try {
            error.config.__isRetry = true;
            const res = await axios.post<AccessToken>(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
            setAccessToken(res.data.access_token);
            
            if (tokenUpdateCallback) {
                tokenUpdateCallback(res.data.access_token);
            }

            error.config.headers.Authorization = `Bearer ${res.data.access_token}`;
            return api.request(error.config);
        } catch {
            setAccessToken(null);
            
            if (tokenUpdateCallback) {
                tokenUpdateCallback(null);
            }
        }
    }

    return Promise.reject(error);
});

export default api;