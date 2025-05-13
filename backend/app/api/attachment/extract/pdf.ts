import { existsSync } from 'node:fs';
import { join } from 'node:path';
import pdf from 'pdf-parse/lib/pdf-parse';
import { Attachment } from 'docs-hub-shared-models';

import { readFile } from '@/app/text-helper/read-file';
import {
	removeXmlTags,
	replaceNewlineChar,
	trimEnd,
} from '@/app/text-helper/trim';

export async function extractTextFromPDF(attachment: Attachment) {
	try {
		const destFilePath = join(attachment.filepath, attachment.destName);

		if (!existsSync(destFilePath)) {
			return '';
		}
		const dataBuffer = await readFile(destFilePath);
		const data = await pdf(dataBuffer);

		return trimEnd(replaceNewlineChar(removeXmlTags(data.text)));
	} catch (error) {
		console.error('Error extracting PDF content:', error);
		return '';
	}
}
