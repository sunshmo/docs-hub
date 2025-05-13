import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Attachment } from 'docs-hub-shared-models';

import { readFile } from '@/app/text-helper/read-file';
import {
	removeXmlTags,
	replaceNewlineChar,
	trimEnd,
} from '@/app/text-helper/trim';

export async function extractTextFromMd(attachment: Attachment) {
	const destFilePath = join(attachment.filepath, attachment.destName);

	if (!existsSync(destFilePath)) {
		return '';
	}

	const buffer = await readFile(destFilePath);
	// 将 ArrayBuffer 转换成 string
	const str = Buffer.from(buffer).toString('utf-8');

	return trimEnd(replaceNewlineChar(removeXmlTags(str)));
}
