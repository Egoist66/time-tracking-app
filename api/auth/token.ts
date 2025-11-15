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
  // CORS headers должны быть установлены ДО любых других операций
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

  try {
    console.log('=== Token Exchange Function Started ===')
    console.log('Timestamp:', new Date().toISOString())
    console.log('Method:', req.method)
    console.log('Origin:', origin)
    console.log('URL:', req.url)

    // Обрабатываем preflight запрос (CORS)
    if (req.method === 'OPTIONS') {
      console.log('OPTIONS request - returning 200')
      return res.status(200).end()
    }

    // Разрешаем только POST запросы
    if (req.method !== 'POST') {
      console.log('Invalid method:', req.method)
      return res.status(405).json({ error: 'Method Not Allowed' })
    }

    console.log('Body:', req.body)
    const { code, grant_type = 'authorization_code', refresh_token } = req.body

    // Валидация входных данных
    if (grant_type === 'authorization_code' && !code) {
      return res.status(400).json({ error: 'Authorization code is required' })
    }

    if (grant_type === 'refresh_token' && !refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' })
    }

    // Получаем секреты из environment variables
    // На Vercel используем обычные env vars (без VITE_ префикса)
    const clientId = process.env.ASANA_CLIENT_ID
    const clientSecret = process.env.ASANA_CLIENT_SECRET
    const redirectUri = process.env.ASANA_REDIRECT_URI

    console.log('Environment variables check:')
    console.log('- ASANA_CLIENT_ID:', clientId ? `Present (${clientId.substring(0, 10)}...)` : 'MISSING')
    console.log('- ASANA_CLIENT_SECRET:', clientSecret ? 'Present (hidden)' : 'MISSING')
    console.log('- ASANA_REDIRECT_URI:', redirectUri || 'MISSING')
    console.log('- Available ASANA env keys:', Object.keys(process.env).filter(k => k.includes('ASANA')))

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Missing environment variables')
      return res.status(500).json({ 
        error: 'Server configuration error',
        details: 'Missing required environment variables (ASANA_CLIENT_ID, ASANA_CLIENT_SECRET, ASANA_REDIRECT_URI)'
      })
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
    console.log('Making request to Asana OAuth endpoint...')
    console.log('Request params:', {
      grant_type,
      client_id: clientId?.substring(0, 10) + '...',
      has_code: !!code,
      has_refresh_token: !!refresh_token,
      redirect_uri: redirectUri
    })

    const response = await fetch('https://app.asana.com/-/oauth_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: params.toString(),
    })

    console.log('Asana API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Asana OAuth error response:', errorText)
      
      let errorData: AsanaErrorResponse
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: 'parse_error', error_description: errorText }
      }
      
      return res.status(response.status).json({
        error: errorData.error || 'Token exchange failed',
        error_description: errorData.error_description || errorText,
      })
    }

    const data = await response.json() as AsanaTokenResponse
    console.log('Token exchange successful')

    // Возвращаем токены клиенту
    return res.status(200).json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
    })
  } catch (error) {
    console.error('=== CRITICAL ERROR ===')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    try {
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error?.constructor?.name || 'Unknown'
      })
    } catch (jsonError) {
      // Если даже JSON не можем отправить, отправляем текст
      console.error('Failed to send JSON response:', jsonError)
      return res.status(500).send('Critical server error')
    }
  }
}

