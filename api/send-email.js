// ============================================
// THY Route — EmailJS Proxy Serverless Function
// Vercel Serverless Function
// ============================================

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

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { templateParams } = req.body;

  if (!templateParams) {
    return res.status(400).json({ error: 'Missing templateParams in request body' });
  }

  // Get credentials from Environment Variables, fallback to hardcoded ones if not defined
  const serviceId = process.env.EMAILJS_SERVICE_ID || 'service_8oc4sw9';
  const templateId = process.env.EMAILJS_TEMPLATE_ID || 'template_y1ch11o';
  const publicKey = process.env.EMAILJS_PUBLIC_KEY || 'Cwjj37r4vlqMA8F83';

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: templateParams
      })
    });

    if (response.ok) {
      return res.status(200).json({ success: true, message: 'Email sent successfully via proxy.' });
    } else {
      const errorText = await response.text();
      console.error('EmailJS REST API error:', errorText);
      return res.status(response.status).json({ error: `EmailJS responded with error: ${errorText}` });
    }
  } catch (error) {
    console.error('EmailJS proxy error:', error);
    return res.status(500).json({ error: `Failed to proxy email: ${error.message}` });
  }
};
