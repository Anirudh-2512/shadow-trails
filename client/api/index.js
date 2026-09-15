const API_HOST = process.env.API_PROXY_HOST || 'https://server-two-sand-17.vercel.app';

export default async function handler(req, res) {
  const url = API_HOST + req.url;
  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (['host', 'connection', 'x-vercel-forwarded-for-uri', 'x-vercel-id', 'x-vercel-deployment-url'].includes(k.toLowerCase())) continue;
    headers[k] = v;
  }
  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req,
      duplex: 'half',
    });
    const isStream = (upstream.headers.get('content-type') || '').includes('stream');
    if (isStream || !/^localhost/.test(upstream.headers.get('host') || 'localhost')) {
      // socket.io upgrade/stream requests can't run on serverless
      if (upstream.status === 599 || upstream.status >= 500 && isStream) {
        res.statusCode = 503;
        return res.json({ error: 'Live sockets unavailable in serverless mode' });
      }
    }

    upstream.headers.forEach((v, k) => {
      if (!['content-encoding', 'transfer-encoding', 'connection', 'content-length'].includes(k.toLowerCase())) {
        res.setHeader(k, v);
      }
    });
    res.statusCode = upstream.status;

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.end(buf);
  } catch (e) {
    res.statusCode = 502;
    res.json({ error: 'API proxy failed' });
  }
}
