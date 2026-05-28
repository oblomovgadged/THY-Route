// ============================================
// THY Route — Aviationstack API Proxy
// Vercel Serverless Function
// ============================================
// Bu dosya API anahtarını sunucu tarafında tutar.
// Client-side koddan /api/flights?type=route&from=IST&to=FCO şeklinde çağrılır.

const AVIATIONSTACK_KEY = '7b44b2dfa6bc8aae041fc12c67e7cee8';

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
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
      apiUrl = `http://api.aviationstack.com/v1/flights?access_key=${AVIATIONSTACK_KEY}&airline_iata=TK&dep_iata=${from}&arr_iata=${to}`;

    } else if (type === 'code') {
      // Flight search by flight code
      if (!code) {
        return res.status(400).json({ error: 'Missing "code" parameter for flight code search.' });
      }
      let cleanCode = code.replace(/\s+/g, '').toUpperCase();
      if (!cleanCode.startsWith('TK') && !cleanCode.startsWith('THY')) {
        cleanCode = 'TK' + cleanCode;
      }
      apiUrl = `http://api.aviationstack.com/v1/flights?access_key=${AVIATIONSTACK_KEY}&airline_iata=TK&flight_iata=${cleanCode}`;

    } else if (type === 'board') {
      // Live flight board feed
      apiUrl = `http://api.aviationstack.com/v1/flights?access_key=${AVIATIONSTACK_KEY}&airline_iata=TK&limit=10`;

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
