// ============================================
// THY Route — Google Maps Key Proxy
// Vercel Serverless Function
// ============================================

const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_KEY;

// In-memory rate limiting map
const rateLimitMap = new Map();

module.exports = async (req, res) => {
  // Rate limiting check (5 requests per 1 minute window)
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
      if (data.count > 5) {
        return res.status(429).json({ error: 'Too many requests. Rate limit is 5 requests per minute.' });
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

  return res.status(200).json({ key: GOOGLE_MAPS_KEY });
};
