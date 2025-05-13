import { NextRequest, NextResponse } from 'next/server';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { randomUUID } from 'crypto';
import { Attachment, FileTypes, ResponseWrapper } from 'docs-hub-shared-models';

import { uploadDir } from '@/constants/file';
import { withTransaction } from '@/lib/with-transaction';
import { getUserId } from '@/lib/get-user-id';

interface FileTempData extends Attachment {
	fileBuffer: Buffer<ArrayBuffer>;
	[prop: string]: unknown;
}

// create
export async function POST(req: NextRequest) {
	if (!existsSync(uploadDir)) {
		mkdirSync(uploadDir, { recursive: true });
	}

	const fileLimitCount = 5;

	const formData = await req.formData();
	const files = formData.getAll('files');

	if (!files || files.length > fileLimitCount) {
		return NextResponse.json(
			ResponseWrapper.error(`No more than ${fileLimitCount}files`),
		);
	}

	const errList: FileTempData[] = [];
	const successList: FileTempData[] = [];

	// 存储文件
	for (const attachment of files) {
		// @ts-expect-error
		const fileBuffer = Buffer.from(await attachment.arrayBuffer());
		// @ts-expect-error
		const ext = extname(attachment.name);
		const validExt = FileTypes.allowedTypes.some((e) =>
			new RegExp(e, 'gi').test(ext),
		);

		if (!validExt) {
			errList.push({
				// @ts-expect-error
				filename: attachment.name,
			} as FileTempData);
			continue;
		}

		const id = randomUUID();
		// 需要存储到数据库
		successList.push({
			id,
			fileBuffer,
			// @ts-expect-error
			filename: attachment.name,
			destName: `${id}${ext}`,
			filepath: uploadDir,
		} as FileTempData);
	}

	if (!successList.length) {
		return NextResponse.json(ResponseWrapper.error('Unknown file type'));
	}

	try {
		const userId = await getUserId(req);

		const files = await withTransaction(async (conn) => {
			const list: Attachment[] = [];
			for (const attachment of successList) {
				const { id, filename, filepath, destName } = attachment;
				const sql: string =
					'INSERT INTO attachment (id, filename, filepath, destName, userId) VALUES (?, ?, ?, ?, ?)';
				const [fileRes] = await conn.query(sql, [
					id,
					filename,
					filepath,
					destName,
					userId,
				]);

				// @ts-expect-error
				if (fileRes.affectedRows === 1) {
					list.push({
						id,
						filename,
						filepath,
						destName,
						userId,
					});
				} else {
					// 失败
					errList.push({
						filename: attachment.filename,
					} as FileTempData);
				}
			}

			return list;
		});

		if (files.length === 0) {
			return NextResponse.json(ResponseWrapper.error('File upload failed'));
		}

		successList.forEach((attachment: FileTempData) => {
			const exists = files.find(
				(f: FileTempData) => f.destName === attachment.destName,
			);
			if (exists) {
				const destFile = join(uploadDir, attachment.destName);
				writeFileSync(destFile, attachment.fileBuffer);
			}
		});

		return NextResponse.json(ResponseWrapper.success(errList.concat(files as FileTempData[])));
	} catch (err) {
		console.error('Error creating attachment:', err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}

// 删除 - 单个
export async function DELETE(req: NextRequest) {
	const { ids } = await req.json();

	if (!Array.isArray(ids)) {
		return NextResponse.json(ResponseWrapper.error('ids should be `string[]`'));
	}

	try {
		const result = await withTransaction(async (conn) => {
			// const [deleteRes] = await conn.query('DELETE FROM attachment WHERE id = ?', [id]);
			const [deleteRes] = await conn.query(
				'UPDATE attachment SET deleted = 1 WHERE id IN (?)',
				[ids],
			);

			return deleteRes;
		});

		// @ts-expect-error
		if (result.affectedRows === ids.length) {
			return NextResponse.json(ResponseWrapper.success(true));
		}

		return NextResponse.json(ResponseWrapper.error('Delete failed'));
	} catch (err) {
		console.error('Error deleting attachment:', err);
		return NextResponse.json(ResponseWrapper.error(err.message, false));
	}
}
