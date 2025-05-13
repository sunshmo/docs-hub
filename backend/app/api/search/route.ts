import { NextRequest, NextResponse } from 'next/server';
import { ResponseWrapper, SearchDataEnum } from 'docs-hub-shared-models';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();

    if (!keyword?.trim()) {
      return NextResponse.json(ResponseWrapper.success([]));
    }

    const kw = keyword.trim();

    const sql = `SELECT
                     d.id,
                     d.name,
                     d.content,
                     NULL AS messageId,
                     '${SearchDataEnum.document}' AS type,
                     DATE_FORMAT(d.updatedAt, '%Y-%m-%d %H:%i:%s') AS updatedAt
                 FROM document d
                 WHERE d.name LIKE CONCAT('%', ?, '%') OR d.content LIKE CONCAT('%', ?, '%')

                 UNION ALL

                 SELECT
                     s.id,
                     s.name,
                     m.content,
                     m.id AS messageId,
                     '${SearchDataEnum.session}' AS type,
                     DATE_FORMAT(GREATEST(s.updatedAt, COALESCE(m.updatedAt, s.updatedAt)), '%Y-%m-%d %H:%i:%s') AS updatedAt
                 FROM session s
                          LEFT JOIN message m ON s.id = m.sessionId
                 WHERE s.name LIKE CONCAT('%', ?, '%') OR m.content LIKE CONCAT('%', ?, '%')

                 ORDER BY updatedAt DESC, type, id, messageId
    `;
    const [rows] = await db.query(sql, [kw, kw, kw, kw]);

    return NextResponse.json(ResponseWrapper.success(rows));
  } catch (err) {
    return NextResponse.json(ResponseWrapper.error(err.message || 'Fuzzy search error'));
  }
}
