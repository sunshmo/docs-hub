import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Attachment } from 'docs-hub-shared-models';

import { readFile } from '@/app/text-helper/read-file';
import {
	removeXmlTags,
	replaceNewlineChar,
	trim,
} from '@/app/text-helper/trim';

export async function extractTextFromTxt(attachment: Attachment) {
	const destFilePath = join(attachment.filepath, attachment.destName);

	if (!existsSync(destFilePath)) {
		console.error(`${destFilePath} does not exist`);
		return '';
	}

	const buffer = await readFile(destFilePath);
	const str = Buffer.from(buffer).toString('utf-8');
	return trim(replaceNewlineChar(removeXmlTags(str)));
}
