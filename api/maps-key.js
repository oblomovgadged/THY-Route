// ============================================
// THY Route — Google Maps Key Proxy
// Vercel Serverless Function
// ============================================

const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_KEY || 'AIzaSyCTFajPJSFiTgXvDdK5AKp6aMwjrRRGhCg';

module.exports = async (req, res) => {
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
