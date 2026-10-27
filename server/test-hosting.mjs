// Run against Wrangler or production: TEST_URL=https://host node server/test-hosting.mjs
import assert from 'node:assert/strict';

const base = process.env.TEST_URL || 'http://127.0.0.1:8797';
for (const path of ['/api', '/api/missing', '/ws', '/ws/missing']) {
  const response = await fetch(base + path);
  assert.equal(response.status, 404, path);
  assert.match(response.headers.get('content-type'), /application\/json/, path);
  assert.equal(response.headers.get('cache-control'), 'no-store', path);
  assert.ok((await response.json()).ralat, path);
}
const page = await fetch(base + '/');
assert.equal(page.status, 200);
assert.match(await page.text(), /Jejak Haji/);
for (const [path, type] of [
  ['/audio/suara-on.mp3', /audio\//],
  ['/models/lelaki-ihram.glb', /model\/gltf-binary|application\/octet-stream/],
  ['/textures/polyhaven/marble_01/color.jpg', /image\/jpeg/],
]) {
  const response = await fetch(base + path);
  assert.equal(response.status, 200, path);
  assert.match(response.headers.get('content-type'), type, path);
  assert.ok((await response.arrayBuffer()).byteLength > 1000, path);
}
console.log('PASS: game, audio, GLB, texture and four JSON no-store API boundaries');
