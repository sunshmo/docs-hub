import { NextRequest, NextResponse } from 'next/server';
import { ResponseWrapper } from 'docs-hub-shared-models';

export async function POST(req: NextRequest) {
  try {
    const { id, content } = await req.json();
    // 导出使用 markitdown，调用python服务
    if (id) {
      // 更新文档并导出
    } else {
      // 创建文档并导出
    }
  } catch (err) {
    return NextResponse.json(ResponseWrapper.error('Export failed'));
  }
}
