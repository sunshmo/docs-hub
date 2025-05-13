import { remark } from 'remark';
import { visit } from 'unist-util-visit';
import { NextRequest, NextResponse } from 'next/server';
import { ResponseWrapper } from 'docs-hub-shared-models';

export async function POST(req: NextRequest) {
	try {
		const { markdown, language, tags } = await req.json();
		if (!language) {
			const codeBlocks = await extractCodeBlocks(markdown, tags);
			return NextResponse.json(ResponseWrapper.success(codeBlocks));
		}

		return NextResponse.json(
			ResponseWrapper.success(extractCodeBlocksWithLang(markdown)),
		);
	} catch (err) {
		console.error(err);
		return NextResponse.json(ResponseWrapper.error('Failed to extract code'));
	}
}

/**
 * 提取markdown里的代码块
 * @param markdown {string}
 * @param tags {string[]}
 * @return Array<string> eg：["console.log(\"Hello World\");","print(\"Hello Python\")"]
 */
async function extractCodeBlocks(
	markdown: string,
	tags?: string[],
): Promise<{
	[prop: string]: string[];
}> {
	if (!Array.isArray(tags)) {
		return {};
	}

	const data: Record<string, string[]> = {};
	for (const key of tags) {
		data[`${key}-Blocks`] = [];
	}

	await remark()
		.use(() => (tree: any) => {
			for (const tag of tags) {
				visit(tree, tag, (node) => {
					const key = `${tag}-Blocks`;
					if (!data[key]) {
						data[key] = [];
					}
					switch (tag) {
						case 'heading':
							data[key].push(node.children[0].value);
							break;
						case 'code':
							data[key].push(node.value);
							break;
					}
				});
			}
		})
		.process(markdown);

	console.log(data);

	return data;
}

interface CodeBlock {
	language: string | null;
	code: string;
}

/**
 * markdown = `
 * # Example Markdown
 * \`\`\`javascript
 * console.log("Hello World");
 * \`\`\`
 *
 * \`\`\`python
 * print("Hello Python")
 * \`\`\`
 *
 * ------------------
 * result: [{language: 'javascript', code: 'console.log("Hello World");'},{language: 'python', code: 'print("Hello Python")'}]
 * @param markdown {string}
 */
function extractCodeBlocksWithLang(markdown: string): {
	codeBlocks: CodeBlock[];
} {
	const codeBlockRegex = /```(\w*)\n([\s\S]*?)\n```/g;
	const codeBlocks: CodeBlock[] = [];
	let match: RegExpMatchArray | null = null;

	while ((match = codeBlockRegex.exec(markdown)) !== null) {
		codeBlocks.push({
			language: match[1] || null,
			code: match[2],
		});
	}

	return {
		codeBlocks,
	};
}
