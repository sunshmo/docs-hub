import { extname } from 'node:path';
import { Attachment } from 'docs-hub-shared-models';

import { extractTextFromMd } from '@/app/api/attachment/extract/markdown';
import { extractTextFromPDF } from '@/app/api/attachment/extract/pdf';
import { extractTextFromTxt } from '@/app/api/attachment/extract/txt';

export async function extract(attachment: Attachment) {
	let result: string = '';

	let ext = extname(attachment.destName);
	if (ext) {
		switch (ext) {
			case '.md':
			case '.markdown':
				result = await extractTextFromMd(attachment);
				break;
			case '.pdf':
				result = await extractTextFromPDF(attachment);
				break;
			default:
				result = await extractTextFromTxt(attachment);
				break;
		}
	} else {
		result = await extractTextFromTxt(attachment);
	}

	return result;
}
