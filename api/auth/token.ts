import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Интерфейсы для типизации ответов Asana OAuth API
 */
interface AsanaTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

interface AsanaErrorResponse {
  error?: string
  error_description?: string
}

/**
 * Vercel Serverless Function для обмена authorization code на access token
 * Это серверный endpoint, который безопасно хранит client_secret
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Включаем CORS для нашего фронтенда
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://time-tracking-app-sigma.vercel.app',
  ]

  const origin = req.headers.origin || ''
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  }

  // Обрабатываем preflight запрос (CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { code, grant_type = 'authorization_code', refresh_token } = req.body

    // Валидация входных данных
    if (grant_type === 'authorization_code' && !code) {
      return res.status(400).json({ error: 'Authorization code is required' })
    }

    if (grant_type === 'refresh_token' && !refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' })
    }

    // Получаем секреты из environment variables
    const clientId = process.env.VITE_ASANA_CLIENT_ID
    const clientSecret = process.env.VITE_ASANA_CLIENT_SECRET
    const redirectUri = process.env.VITE_ASANA_REDIRECT_URI

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Missing environment variables:', { clientId: !!clientId, clientSecret: !!clientSecret, redirectUri: !!redirectUri })
      return res.status(500).json({ error: 'Server configuration error' })
    }

    // Формируем параметры для запроса к Asana
    const params = new URLSearchParams({
      grant_type,
      client_id: clientId,
      client_secret: clientSecret,
    })

    if (grant_type === 'authorization_code') {
      params.append('code', code)
      params.append('redirect_uri', redirectUri)
    } else if (grant_type === 'refresh_token') {
      params.append('refresh_token', refresh_token)
    }

    // Делаем запрос к Asana OAuth endpoint
    const response = await fetch('https://app.asana.com/-/oauth_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      const errorData = await response.json() as AsanaErrorResponse
      console.error('Asana OAuth error:', errorData)
      return res.status(response.status).json({
        error: errorData.error || 'Token exchange failed',
        error_description: errorData.error_description || 'Unknown error',
      })
    }

    const data = await response.json() as AsanaTokenResponse

    // Возвращаем токены клиенту
    return res.status(200).json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
    })
  } catch (error) {
    console.error('Token exchange error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

