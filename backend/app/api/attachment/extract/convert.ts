import { existsSync } from 'node:fs';
import { parse, join } from 'node:path';
import { Attachment } from 'docs-hub-shared-models';
import { execSync } from 'child_process';

import { readFile } from '@/app/text-helper/read-file';
import {
  replaceNewlineChar,
  trimEnd,
} from '@/app/text-helper/trim';

export async function convert(attachment: Attachment) {
  const destFilePath = join(attachment.filepath, attachment.destName);

  if (!existsSync(destFilePath)) {
    return '';
  }
  const { name } = parse(attachment.destName);
  const finalFilePath = join(attachment.filepath, `${name}.md`);

  try {
    const output = execSync(`markitdown ${destFilePath} > ${finalFilePath}`);

    console.log('========= convert to markdown', output.toString())

    const buffer = await readFile(finalFilePath);
    // 将 ArrayBuffer 转换成 string
    const str = Buffer.from(buffer).toString('utf-8');

    return trimEnd(replaceNewlineChar(str));
  } catch (err) {
    console.error('convert failed');
    return '';
  }
}
