export default async function handler(req, res) {
    if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { secret, page = '1', filter_resolved, date_start, date_end } = req.query;

  if (!process.env.PROXY_SECRET || secret !== process.env.PROXY_SECRET) {
        res.setHeader('Content-Type', 'text/html');
        return res.status(401).send('<html><body><pre>{"error":"Unauthorized"}</pre></body></html>');
  }

  const identifier = process.env.CRISP_IDENTIFIER;
    const key = process.env.CRISP_KEY;
    const websiteId = process.env.CRISP_WEBSITE_ID;

  const auth = Buffer.from(`${identifier}:${key}`).toString('base64');

  const params = new URLSearchParams();
    if (filter_resolved) params.append('filter_resolved', filter_resolved);
    if (date_start) params.append('filter_date_start', date_start);
    if (date_end) params.append('filter_date_end', date_end);
    params.append('order_date_updated', '1');

  const url = `https://api.crisp.chat/v1/website/${websiteId}/conversations/${page}?${params.toString()}`;

  try {
        const response = await fetch(url, {
                headers: {
                          'Authorization': `Basic ${auth}`,
                          'X-Crisp-Tier': 'plugin'
                }
        });
        const data = await response.json();
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send('<html><body><pre>' + JSON.stringify(data) + '</pre></body></html>');
  } catch (error) {
        res.setHeader('Content-Type', 'text/html');
        res.status(500).send('<html><body><pre>{"error":"' + error.message + '"}</pre></body></html>');
  }
}
