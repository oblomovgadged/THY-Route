// ============================================
// THY Route — Aviationstack API Proxy
// Vercel Serverless Function
// ============================================
// Bu dosya API anahtarını sunucu tarafında tutar.
// Client-side koddan /api/flights?type=route&from=IST&to=FCO şeklinde çağrılır.

// Aviationstack API Key - Read from Vercel Environment Variables, fallback to hardcoded default if undefined
const AVIATIONSTACK_KEY = process.env.AVIATIONSTACK_KEY || '7b44b2dfa6bc8aae041fc12c67e7cee8';

// Aviationstack Free subscription tier restricts request traffic to unencrypted HTTP only.
// If you have a paid plan, set the environment variable AVIATIONSTACK_HTTPS=true in Vercel to force HTTPS.
const protocol = process.env.AVIATIONSTACK_HTTPS === 'true' ? 'https' : 'http';

// In-memory rate limiting map
const rateLimitMap = new Map();

module.exports = async (req, res) => {
  // Rate limiting check (15 requests per 1 minute window)
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  const now = Date.now();

  // Periodically clean up expired entries to prevent memory leaks
  if (rateLimitMap.size > 500) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.resetTime) rateLimitMap.delete(k);
    }
  }

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
  } else {
    const data = rateLimitMap.get(ip);
    if (now > data.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    } else {
      data.count++;
      if (data.count > 15) {
        return res.status(429).json({ error: 'Too many requests. Rate limit is 15 requests per minute.' });
      }
    }
  }
  // Dynamic CORS setup
  const origin = req.headers.origin;
  let corsOrigin = null;

  if (origin) {
    if (/^http:\/\/localhost(:\d+)?$/.test(origin)) {
      corsOrigin = origin;
    } else if (origin === 'https://thy-route.vercel.app' || (origin.startsWith('https://thy-route-') && origin.endsWith('.vercel.app'))) {
      corsOrigin = origin;
    }
  }

  if (corsOrigin) {
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  } else if (origin) {
    return res.status(403).json({ error: 'CORS policy: Access Denied.' });
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { type, from, to, code } = req.query;

  if (!type) {
    return res.status(400).json({ error: 'Missing "type" parameter. Use: route, code, or board.' });
  }

  try {
    let apiUrl = '';

    if (type === 'route') {
      // Flight search by route (from/to)
      if (!from || !to) {
        return res.status(400).json({ error: 'Missing "from" or "to" parameters for route search.' });
      }
      apiUrl = `${protocol}://api.aviationstack.com/v1/flights?access_key=${AVIATIONSTACK_KEY}&airline_iata=TK&dep_iata=${from}&arr_iata=${to}`;

    } else if (type === 'code') {
      // Flight search by flight code
      if (!code) {
        return res.status(400).json({ error: 'Missing "code" parameter for flight code search.' });
      }
      let cleanCode = code.replace(/\s+/g, '').toUpperCase();
      if (!cleanCode.startsWith('TK') && !cleanCode.startsWith('THY')) {
        cleanCode = 'TK' + cleanCode;
      }
      apiUrl = `${protocol}://api.aviationstack.com/v1/flights?access_key=${AVIATIONSTACK_KEY}&airline_iata=TK&flight_iata=${cleanCode}`;

    } else if (type === 'board') {
      // Live flight board feed
      apiUrl = `${protocol}://api.aviationstack.com/v1/flights?access_key=${AVIATIONSTACK_KEY}&airline_iata=TK&limit=10`;

    } else {
      return res.status(400).json({ error: 'Invalid "type". Use: route, code, or board.' });
    }

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Aviationstack API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      return res.status(502).json({ 
        error: 'Aviationstack API error', 
        details: data.error.message || data.error.info || 'Unknown error' 
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error('Aviationstack proxy error:', err);
    return res.status(500).json({ error: 'Proxy request failed', details: err.message });
  }
};
