// POST /api/submit — 응답 한 건을 저장한다. 누구나 호출할 수 있으므로 형식과 크기만 확인한다.
import { saveRecord } from '../lib/store.js';

const MAX_BYTES = 100 * 1024;

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return; }
  let body = req.body;
  try { if (typeof body === 'string') body = JSON.parse(body); } catch (e) { body = null; }
  if (!body || typeof body !== 'object' || Array.isArray(body)) { res.status(400).json({ error: 'invalid_body' }); return; }
  const raw = JSON.stringify(body);
  if (raw.length > MAX_BYTES) { res.status(413).json({ error: 'too_large' }); return; }
  const id = body.sessionId;
  if (typeof id !== 'string' || !/^[a-z0-9]{8,40}$/.test(id)) { res.status(400).json({ error: 'invalid_session' }); return; }
  if (typeof body.typeCode !== 'string' || !/^[A-Z]{4}$/.test(body.typeCode) || !Array.isArray(body.responses) || body.responses.length !== 12) {
    res.status(400).json({ error: 'invalid_record' }); return;
  }
  try {
    await saveRecord(id, Object.assign({}, body, { receivedAt: new Date().toISOString() }));
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('save failed', e);
    res.status(500).json({ error: 'save_failed' });
  }
}
