import {
  tokenApiUrl,
  userApiUrl,
  clientId,
  redirectUri,
  asanaScope,
} from "../constants";
import type { AsanaTokenResponse } from "../types/authstate.type";
import type { AsanaUser } from "../types/user.type";

const OAUTH_STATE_KEY = "oauth_state";


/**
 * AsanaAuth class provides methods to interact with the Asana OAuth API.
 */
export class AsanaAuth {
 
  static async exchangeCodeForToken(code: string): Promise<AsanaTokenResponse> {
    try {
      const response = await fetch(tokenApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code: code,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to exchange code for token");
      }

      const data = await response.json();
      return data as AsanaTokenResponse;
    } catch (error) {
      throw new Error("Failed to exchange code for token: " + " " + error);
    }
  }

  static async fetchUser(accessToken: string): Promise<AsanaUser> {
    try {
      const response = await fetch(userApiUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Не удалось получить данные пользователя");
      }

      const data = await response.json();
      return data.data as AsanaUser;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Не удалось получить данные пользователя"
      );
    }
  }

  static async refreshAccessToken(
    refreshToken: string
  ): Promise<AsanaTokenResponse> {
    try {
      const response = await fetch(tokenApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Не удалось обновить токен");
      }

      const data = await response.json();
      return data as AsanaTokenResponse;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Не удалось обновить токен"
      );
    }
  }

  static generateOAuthUrl(): string {
    // Генерируем state для защиты от CSRF
    const state = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem(OAUTH_STATE_KEY, state);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: asanaScope,
      state,
    });

    return `https://app.asana.com/-/oauth_authorize?${params.toString()}`;
  }

  static verifyState(state: string): boolean {
    const savedState = sessionStorage.getItem(OAUTH_STATE_KEY);
    sessionStorage.removeItem(OAUTH_STATE_KEY);
    return state === savedState;
  }
}
