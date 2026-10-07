// GET /api/export — 저장된 전체 응답을 JSON 배열로 돌려준다. 관리자 키(x-admin-key 헤더)가 맞아야 한다.
import { timingSafeEqual } from 'node:crypto';
import { loadAllRecords } from '../lib/store.js';

function keyOk(given) {
  const want = process.env.ADMIN_KEY || '';
  if (!want || typeof given !== 'string') return false;
  const a = Buffer.from(given), b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  if (!process.env.ADMIN_KEY) { res.status(503).json({ error: 'admin_key_not_set' }); return; }
  if (!keyOk(req.headers['x-admin-key'])) { res.status(401).json({ error: 'unauthorized' }); return; }
  try {
    const records = await loadAllRecords();
    res.status(200).json({ count: records.length, records });
  } catch (e) {
    console.error('export failed', e);
    res.status(500).json({ error: 'export_failed' });
  }
}
