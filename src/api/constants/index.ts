// Constants
export const AUTH_STORAGE_KEY = "asana_auth";


// Asana environment variables
export const clientId = import.meta.env.VITE_ASANA_CLIENT_ID;
export const redirectUri = import.meta.env.VITE_ASANA_REDIRECT_URI;
export const asanaToken = import.meta.env.VITE_ASANA_TOKEN;


// Asana constants
export const asanaBaseUrl = "https://app.asana.com/api/1.0";
export const asanaState =  Math.random().toString(36).substring(2, 15);
export const asanaScope = "openid email profile default identity";
export const tokenApiUrl = `${asanaBaseUrl}/auth/token`;
export const userApiUrl = `${asanaBaseUrl}/users/me`;
