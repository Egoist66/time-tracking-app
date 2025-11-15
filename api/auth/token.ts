import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Vercel Serverless Function для обмена authorization code на access token
 * Это серверный endpoint, который безопасно хранит client_secret
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

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

  // Обрабатываем preflight запрос
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
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
    const clientId = process.env.ASANA_CLIENT_ID
    const clientSecret = process.env.ASANA_CLIENT_SECRET
    const redirectUri = process.env.ASANA_REDIRECT_URI

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

    const data = await response.json()

    if (!response.ok) {
      console.error('Asana OAuth error:', data)
      return res.status(response.status).json({
        error: data.error || 'Token exchange failed',
        error_description: data.error_description || 'Unknown error',
      })
    }

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

