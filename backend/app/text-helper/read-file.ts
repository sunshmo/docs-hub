import { createReadStream, PathLike } from 'node:fs';
import { Writable } from 'node:stream';

class ArrayBufferCollector extends Writable {
	chunks: Array<Buffer<ArrayBufferLike>>;
	totalLength: number;

	constructor() {
		super();
		this.chunks = [];
		this.totalLength = 0;
	}

	_write(
		chunk: Buffer<ArrayBufferLike>,
		encoding: string,
		callback: () => void,
	) {
		this.chunks.push(chunk);
		this.totalLength += chunk.length;
		callback();
	}

	getArrayBuffer() {
		const arrayBuffer = new ArrayBuffer(this.totalLength);
		const view = new Uint8Array(arrayBuffer);
		let offset = 0;

		for (const chunk of this.chunks) {
			view.set(chunk, offset);
			offset += chunk.length;
		}

		return arrayBuffer;
	}
}

export function readFile(destFile: PathLike) {
	return new Promise<ArrayBuffer>((resolve) => {
		const collector = new ArrayBufferCollector();

		createReadStream(destFile)
			.pipe(collector)
			.on('finish', () => {
				const arrayBuffer = collector.getArrayBuffer();
				// console.log('收集的ArrayBuffer大小:', arrayBuffer.byteLength);
				resolve(arrayBuffer);
			});
	});
}
