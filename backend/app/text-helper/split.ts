// 按段落分割
export function splitByParagraphs(text: string, paragraphsPerChunk = 3) {
	const paragraphs = text.split(/\n\s*\n/); // 匹配各种换行情况
	const chunks: string[] = [];

	for (let i = 0; i < paragraphs.length; i += paragraphsPerChunk) {
		const chunk = paragraphs.slice(i, i + paragraphsPerChunk).join('\n\n');
		chunks.push(chunk);
	}

	return chunks;
}

// 按照关键词
export function splitByKeyword(text: string, keyword: string): string[] {
	return text.split(keyword);
}

// 带重叠的分割（保持上下文，适合英文）。按单词带重叠分割（适用于 NLP）
export function splitWordsWithOverlap(
	text: string,
	chunkSize = 2000,
	stepSize = 200,
) {
	let words = text.split(/\s+/);
	let result: string[] = [];

	for (let i = 0; i < words.length; i += stepSize) {
		let chunk = words.slice(i, i + chunkSize).join(' ');
		if (chunk.length > 0) {
			result.push(chunk);
		}
		if (i + chunkSize >= words.length) break;
	}

	return result;
}

// console.log(splitWordsWithOverlap("GPT generates long text, which needs overlapping segmentation.", 5, 3));
// ['GPT generates long text, which', 'text, which needs overlapping segmentation.']

// 按字符带重叠分割
export function splitWithOverlap(
	text: string,
	chunkSize = 2000,
	stepSize = 200,
) {
	let result: string[] = [];
	for (let i = 0; i < text.length; i += stepSize) {
		let chunk = text.substring(i, i + chunkSize);
		if (chunk.length > 0) {
			result.push(chunk);
		}
		if (i + chunkSize >= text.length) break;
	}
	return result;
}

// console.log(splitWithOverlap("这是一个长文本，需要进行带重叠的分割处理。", 10, 5));
// ["这是一个长文本，需", "文本，需要进行带", "需要进行带重叠的", "行带重叠的分割处"]

// 适用于中文/英文 按句子切分，防止语义割裂
export function splitSentencesWithOverlap(
	text: string,
	chunkSize = 2000,
	stepSize = 200,
) {
	let sentences = text.match(/[^.。!！?？]+[.。!！?？]?/g); // 句子拆分
	if (!Array.isArray(sentences)) {
		return [];
	}

	let result: string[] = [];

	for (let i = 0; i < sentences.length; i += stepSize) {
		let chunk = sentences.slice(i, i + chunkSize).join('');
		if (chunk.length > 0) {
			result.push(chunk);
		}
		if (i + chunkSize >= sentences.length) break;
	}

	return result;
}

// console.log(splitSentencesWithOverlap("第一句。这是第二句！第三句来了？这是第四句。", 2, 1));

export function splitTextWithAutoOverlap(
	text: string,
	chunkSize = 2000,
	overlapRatio = 0.3,
) {
	// 验证 chunkSize 合法
	if (chunkSize <= 0) {
		throw new Error('chunkSize 必须大于 0');
	}
	// 计算实际步长 step = chunkSize - overlap 的长度
	// 注意：Math.floor 确保步长为整数
	const overlapLength = Math.floor(chunkSize * overlapRatio);
	const stepSize = chunkSize - overlapLength;
	if (stepSize <= 0) {
		throw new Error('overlapRatio 太大，导致步长 <= 0，请调低 overlapRatio');
	}

	const result: string[] = [];
	// 使用 stepSize 作为滑动窗口的步长
	for (let i = 0; i < text.length; i += stepSize) {
		// 从 i 开始截取 chunkSize 长度（最后可能不足 chunkSize）
		const chunk = text.substring(i, i + chunkSize);
		result.push(chunk);
		// 当窗口覆盖完所有文本后，退出循环
		if (i + chunkSize >= text.length) break;
	}
	return result;
}
// console.log(splitTextWithAutoOverlap("第一句。这是第二句！第三句来了？这是第四句。", 20));
// ['第一句。这是第二句！第三句来了？这是第四', '了？这是第四句。']

export function splitTextBySentencesWithOverlap(
	text: string,
	chunkSize = 200,
	overlapRatio = 0.3,
) {
	// 将中英文句子分隔符统一处理：中文（。！？）+ 英文（.?!）
	const sentenceRegex = /[^。！？.?!\r\n]+[。！？.?!]?/g;
	const sentences =
		text
			.match(sentenceRegex)
			?.map((s) => s.trim())
			.filter(Boolean) || [];

	const overlapSize = Math.floor(chunkSize * overlapRatio);
	const stepSize = chunkSize - overlapSize;

	if (stepSize <= 0) {
		throw new Error(
			'overlapRatio 太大，导致步长 <= 0，请减小 overlapRatio 或增加 chunkSize',
		);
	}

	const result: string[] = [];
	for (let i = 0; i < sentences.length; i += stepSize) {
		const chunk = sentences.slice(i, i + chunkSize).join(' ');
		result.push(chunk);
		if (i + chunkSize >= sentences.length) break;
	}

	return result;
}
// console.log(splitTextBySentencesWithOverlap(`
// 这是第一句中文。This is the first English sentence.
// 这是第二句！GPT 处理需要上下文连续性。So we must make sure the segments are overlapping.
// 再来一句作为例子？OK, let's see how it performs on bilingual text.
// `, 3, 0.5));

// 输出：[
//   "这是第一句中文。 This is the first English sentence. 这是第二句！",
//   "这是第二句！ GPT 处理需要上下文连续性。 So we must make sure the segments are overlapping.",
//   "So we must make sure the segments are overlapping. 再来一句作为例子？ OK, let's see how it performs on bilingual text."
// ]
