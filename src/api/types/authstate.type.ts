import type { AsanaUser } from "./user.type";

export interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: number | null;
    user: AsanaUser | null;
}

export interface AsanaTokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
}