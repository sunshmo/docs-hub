// @ts-nocheck
// https://www.npmjs.com/package/stream
import { Readable } from 'stream';
import { removeXmlTags, trim } from '@/app/text-helper/trim';

type StringEmptyFn = () => void;
type StringDataFn = (str: string) => void;

interface Options {
	defaultSize?: number;
	onData?: StringDataFn;
	onEnd?: StringEmptyFn;
	onError?: StringEmptyFn;
}

// 以流式读取字符串
export function readString(str: string, options?: Options) {
	const {
		defaultSize = 65536, // read的默认值，可以设置成200，长度为600读取三次
		onData,
		onEnd,
		onError,
	} = options || {};

	return new Promise<string>((resolve, reject) => {
		// str = 'Hello, this is a long string being read as a stream.'.repeat(10000); // length: 520000
		let res = '';

		const readableStream = new Readable({
			read(size: number) {
				size = defaultSize;
				if (this.content.length === 0) {
					this.push(null); // 结束流
				} else {
					const slice = this.content.slice(0, size);
					res += slice; // 累加字符
					this.push(slice); // 读取部分数据
					this.content = this.content.slice(size);
				}
			},
		});

		readableStream.content = str; // 存储字符串数据

		readableStream.on('data', (chunk: Buffer) => {
			if (typeof onData === 'function') {
				onData(chunk.toString());
			}
		});

		readableStream.on('end', () => {
			// res = trim(removeXmlTags(res));
			if (typeof onEnd === 'function') {
				onEnd(res);
			}

			resolve(res);
		});

		readableStream.on('error', (err: Error) => {
			if (typeof onError === 'function') {
				onError(err);
			}

			// reject(err);
			resolve('');
		});
	});
}
