export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q) {
    return new Response(JSON.stringify({ error: 'Missing q parameter' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',

      },
    });
  }

  const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5&lang=en`;

  try {
    const photonRes = await fetch(photonUrl);
    if (!photonRes.ok) throw new Error(`Photon API error: ${photonRes.status} ${photonRes.statusText}`);
    const data = await photonRes.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch from Photon API' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
