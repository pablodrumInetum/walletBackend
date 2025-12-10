// api/getNFTs.js
export default async function handler(request, response) {
  // 1. Permitimos CORS para que tu app pueda llamar desde cualquier lado
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Manejo de pre-flight request (opcional pero recomendado)
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // 2. Solo permitimos GET (La API de NFTs de Alchemy es GET)
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method Not Allowed. Use GET.' });
  }

  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: 'Server misconfiguration: No API Key' });
  }

  // 3. Obtenemos los parámetros que envía Flutter
  const { network, owner, excludeFilters } = request.query;

  if (!network || !owner) {
    return response.status(400).json({ error: 'Missing network or owner parameter' });
  }

  // 4. Construimos la URL de Alchemy NFT API v3
  // Nota la diferencia: usamos /nft/v3/ en lugar de /v2/
  const alchemyUrl = `https://${network}/nft/v3/${apiKey}/getNFTsForOwner?owner=${owner}&excludeFilters=${excludeFilters || 'SPAM'}`;

  try {
    // 5. Llamamos a Alchemy
    const alchemyResponse = await fetch(alchemyUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await alchemyResponse.json();

    // 6. Devolvemos la data a Flutter
    return response.status(200).json(data);

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}