export interface AsanaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface AsanaErrorResponse {
  error?: string;
  error_description?: string;
}
