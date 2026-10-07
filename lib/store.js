// 응답 저장소: Vercel Blob(비공개 저장소). 세션 한 건 = responses/<sessionId>.json 파일 하나.
// 같은 세션이 다시 보내면 덮어쓴다. 환경 변수 BLOB_READ_WRITE_TOKEN은 Blob 저장소를 프로젝트에 연결하면 자동으로 생긴다.
import { put, list, get } from '@vercel/blob';

const PREFIX = 'responses/';

export async function saveRecord(sessionId, record) {
  await put(`${PREFIX}${sessionId}.json`, JSON.stringify(record), {
    access: 'private', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json'
  });
}

export async function loadAllRecords() {
  const paths = [];
  let cursor;
  do {
    const page = await list({ prefix: PREFIX, cursor, limit: 1000 });
    page.blobs.forEach(b => paths.push(b.pathname));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  const records = [];
  for (let i = 0; i < paths.length; i += 20) { // 한 번에 20개씩 읽는다
    const chunk = await Promise.all(paths.slice(i, i + 20).map(async p => {
      try {
        const r = await get(p, { access: 'private', useCache: false });
        if (!r || !r.stream) return null;
        return JSON.parse(await new Response(r.stream).text());
      } catch (e) { return null; }
    }));
    chunk.forEach(x => { if (x) records.push(x); });
  }
  records.sort((a, b) => String(a.receivedAt || '').localeCompare(String(b.receivedAt || '')));
  return records;
}
