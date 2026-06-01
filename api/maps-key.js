// ============================================
// THY Route — Google Maps Key Proxy
// Vercel Serverless Function
// ============================================

const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_KEY || 'AIzaSyCTFajPJSFiTgXvDdK5AKp6aMwjrRRGhCg';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({ key: GOOGLE_MAPS_KEY });
};
