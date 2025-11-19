// api/rpc.js
export default async function handler(request, response) {
  // 1. Solo permitimos peticiones POST (las llamadas a blockchain son POST)
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Obtenemos la API Key segura desde las variables de entorno de Vercel
  const apiKey = process.env.ALCHEMY_API_KEY;
  
  if (!apiKey) {
    return response.status(500).json({ error: 'Server misconfiguration: No API Key' });
  }

  // 3. Recibimos el cuerpo de la petición que viene desde Flutter
  // (Ej: { jsonrpc: "2.0", method: "eth_getBalance", params: [...] })
  const body = request.body;
  
  // 4. Decidimos a qué red de Alchemy enviar según un parámetro que mandaremos desde Flutter
  // O por defecto usamos Sepolia Arbitrum
  const networkUrl = request.query.network || 'arb-sepolia.g.alchemy.com';
  
  const alchemyUrl = `https://${networkUrl}/v2/${apiKey}`;

  try {
    // 5. Hacemos la llamada REAL a Alchemy (aquí es donde se usa la clave)
    const alchemyResponse = await fetch(alchemyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await alchemyResponse.json();

    // 6. Devolvemos el resultado a tu App Flutter
    return response.status(200).json(data);

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}