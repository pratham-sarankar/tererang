import assert from 'node:assert/strict';

const base = process.env.SMOKE_BASE_URL || 'http://localhost:8081';
const request = (path, options) => fetch(`${base}${path}`, {
  ...options,
  signal: AbortSignal.timeout(10000),
});

for (const path of ['/', '/shop', '/admin/login']) {
  const response = await request(path);
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.match(html, /id="root"/, path);
  if (path === '/') {
    const asset = html.match(/src="([^"]+\.js)"/)?.[1];
    assert.ok(asset, 'Built JavaScript asset exists');
    const js = await request(asset);
    assert.equal(js.status, 200);
    assert.match(js.headers.get('content-type'), /javascript/);
    assert.match(await js.text(), /\/backend/, 'Built app uses the API proxy');
  }
  console.log(`PASS frontend ${path}`);
}
for (const path of ['/api/health', '/api/products', '/api/settings']) {
  const response = await request(`/backend${path}`);
  assert.equal(response.status, 200, path);
  await response.json();
  console.log(`PASS proxied ${path}`);
}
const unauthorized = await request('/backend/api/admin/verify');
assert.equal(unauthorized.status, 401);
console.log('PASS protected endpoint rejects unauthenticated access');
const preflight = await request('/backend/api/products', {
  method: 'OPTIONS',
  headers: { Origin: base, 'Access-Control-Request-Method': 'GET' },
});
assert.equal(preflight.status, 204);
console.log('PASS CORS preflight');
