// import { RoleType } from 'docs-hub-shared-models';
//
// const baseURL = 'http://localhost:11434/api/chat';
//
// // 返回 ReadableStream 或 null
// export async function callOllamaStream(
// 	params: {
// 		model?: string;
// 		messages?: { role: RoleType; content: string }[];
// 		[prop: string]: unknown;
// 	},
// 	signal: AbortSignal,
// 	onFinally?: (str: string) => void,
// ) {
// 	const { model, messages, temperature, ...rest } = params;
// 	const response = await fetch(baseURL, {
// 		method: 'post',
// 		body: JSON.stringify({
// 			model: model ?? 'deepseek-r1:1.5b', // deepseek-r1:7b
// 			messages,
// 			temperature,
// 			...rest,
// 			stream: true,
// 		}),
// 	});
//
// 	// 如果请求失败
// 	if (!response.ok) {
// 		return null;
// 	}
//
// 	let tmpContent = '';
//
// 	const reader = response.body.getReader();
// 	const encoder = new TextEncoder();
//
// 	return new ReadableStream({
// 		async start(controller) {
// 			try {
// 				while (true) {
// 					const { done, value } = await reader.read();
// 					if (done) break;
//
// 					// 解析Ollama的流式响应
// 					const chunk = new TextDecoder().decode(value);
// 					const lines = chunk.split('\n').filter((line) => line.trim());
//
// 					for (const line of lines) {
// 						if (signal.aborted) {
// 							console.log('客户端已断开');
// 							controller.close();
// 							break;
// 						}
// 						try {
// 							const data = JSON.parse(line);
// 							// {model, created_at, message: {role, content}, done}
// 							const { message, done: streamDone } = data;
//
// 							if (message) {
// 								// todo: `\u003cthink\u003e` 和 `\u003c/think\u003e` 之间的可以去掉
// 								if (['<think>', '</think>'].includes(message.content)) {
// 									continue;
// 								}
// 								tmpContent += message.content;
//
// 								controller.enqueue(
// 									encoder.encode(`${JSON.stringify({ ...message })}\n\n`),
// 								);
// 								// controller.enqueue(encoder.encode(`data: ${JSON.stringify({ ...message })}\n\n`));
// 							}
// 							if (streamDone) {
// 								controller.close();
// 								return null;
// 							}
// 						} catch (e) {
// 							console.error('解析错误:', e);
// 							return null;
// 						}
// 					}
// 				}
// 			} catch (error) {
// 				controller.error(error);
//
// 				if (error.name === 'AbortError') {
// 					console.log('Request aborted');
// 				}
//
// 				return null;
// 			} finally {
// 				if (typeof onFinally === 'function') {
// 					onFinally(tmpContent);
// 				}
// 				controller.close();
// 			}
// 		},
// 		async cancel(reason) {
// 			console.log('流被主动取消，原因:', reason);
// 		},
// 	});
// }
//
// // 返回 message 或者 null
// export async function callOllamaDefault(params: {
// 	model?: string;
// 	messages: { role: RoleType; content: string }[];
// 	[prop: string]: unknown;
// }) {
// 	const { model, messages, temperature, ...rest } = params;
//
// 	// 返回值案例：{
// 	//     "model": "deepseek-r1:1.5b",
// 	//     "created_at": "2025-04-12T08:46:59.908081Z",
// 	//     "message": {
// 	//         "role": "assistant",
// 	//         "content": "\u003cthink\u003e\n嗯，用户让我用中文简洁地解释一段代码。这段代码看起来是关于一个函数sum的定义，里面有参数a和b，返回它们的和。\n\n首先，我需要明确这段代码的基本功能。函数sum接受两个参数a和b，并将它们相加并返回结果。这听起来像是用来累加两个数的一种方式，可能用于简单计算或者数据处理中。\n\n接下来，我应该考虑用户的身份。如果我是代码分析助手，可能是想帮助开发者理解代码的功能，或者优化代码的性能。因此，解释时需要清晰、简洁，并且涵盖函数的定义、参数的作用和返回值的重要性。\n\n然后，我要检查是否有任何特殊情况需要注意。比如，是否a或b是数值类型，是否处理了非数字的情况？因为如果a或b不是数，直接相加可能会导致错误，所以应该指出这一点，帮助用户了解潜在的问题。\n\n另外，我需要确保解释符合中文的表达习惯，使用易懂的语言，避免专业术语过多。同时，要保持简洁，只点明关键部分，不冗长。\n\n最后，我会组织语言，先介绍函数sum的基本结构和功能，然后讨论它的参数含义，接着说明返回值的作用，最后提到潜在的问题处理，这样用户可以全面理解这段代码的功能和可能的应用场景。\n\u003c/think\u003e\n\n这段代码定义了一个名为`sum`的函数，并将两个参数相加并返回结果。函数的核心作用是将两个数值相加，通常用于简单的累加计算或数据汇总。需要注意的是，如果输入的参数不是数字，直接进行相加可能会导致错误，因此在使用时应对非数字类型的数据进行处理或转换。"
// 	//     },
// 	//     "done_reason": "stop",
// 	//     "done": true,
// 	//     "total_duration": 15238079407,
// 	//     "load_duration": 26704863,
// 	//     "prompt_eval_count": 39,
// 	//     "prompt_eval_duration": 471444524,
// 	//     "eval_count": 345,
// 	//     "eval_duration": 14738853721
// 	// }
// 	const response = await fetch(baseURL, {
// 		method: 'post',
// 		body: JSON.stringify({
// 			messages,
// 			model: model ?? 'deepseek-r1:1.5b', // deepseek-r1:7b
// 			temperature,
// 			...rest,
// 			stream: false,
// 		}),
// 	});
//
// 	// 如果请求失败
// 	if (!response.ok) {
// 		return null;
// 	}
//
// 	// {role: 'assistant', content: ''}
// 	const { message } = await response.json();
//
// 	return message;
// }
import { RoleType } from 'docs-hub-shared-models';

const baseURL = 'http://localhost:11434/api/chat';

// 返回 ReadableStream 或 null
export async function callOllamaStream(
	params: {
		model?: string;
		messages?: { role: RoleType; content: string }[];
		[prop: string]: unknown;
	},
	signal: AbortSignal,
	onFinally?: (str: string) => void,
) {
	const { model, messages, temperature, ...rest } = params;
	const response = await fetch(baseURL, {
		method: 'post',
		body: JSON.stringify({
			model: model ?? 'deepseek-r1:1.5b', // deepseek-r1:7b
			messages,
			temperature,
			...rest,
			stream: true,
		}),
	});

	// 如果请求失败
	if (!response.ok) {
		return null;
	}

	let tmpContent = '';

	if (!response.body) {
		return null;
	}

	const reader = response.body.getReader();
	const encoder = new TextEncoder();

	return new ReadableStream({
		async start(controller) {
			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					// 解析Ollama的流式响应
					const chunk = new TextDecoder().decode(value);
					const lines = chunk.split('\n').filter((line) => line.trim());

					for (const line of lines) {
						if (signal.aborted) {
							console.log('客户端已断开');
							controller.close();
							break;
						}
						try {
							const data = JSON.parse(line);
							// {model, created_at, message: {role, content}, done}
							const { message, done: streamDone } = data;

							if (message) {
								// todo: `\u003cthink\u003e` 和 `\u003c/think\u003e` 之间的可以去掉
								if (['<think>', '</think>'].includes(message.content)) {
									continue;
								}
								tmpContent += message.content;

								controller.enqueue(
									encoder.encode(`${JSON.stringify(message.content)}\n\n`),
									// encoder.encode(`${JSON.stringify({ ...message })}\n\n`),
								);
								// controller.enqueue(encoder.encode(`data: ${JSON.stringify({ ...message })}\n\n`));
							}
							if (streamDone) {
								controller.close();
								return null;
							}
						} catch (e) {
							console.error('解析错误:', e);
							return null;
						}
					}
				}
			} catch (error) {
				controller.error(error);

				if (error.name === 'AbortError') {
					console.log('Request aborted');
				}
			} finally {
				if (typeof onFinally === 'function') {
					onFinally(tmpContent);
				}
				controller.close();
			}
		},
		async cancel(reason) {
			console.log('流被主动取消，原因:', reason);
		},
	});
}

// 返回 message 或者 null
export async function callOllamaDefault(params: {
	model?: string;
	messages: { role: RoleType; content: string }[];
	[prop: string]: unknown;
}) {
	const { model, messages, temperature, ...rest } = params;

	// 返回值案例：{
	//     "model": "deepseek-r1:1.5b",
	//     "created_at": "2025-04-12T08:46:59.908081Z",
	//     "message": {
	//         "role": "assistant",
	//         "content": "\u003cthink\u003e\n嗯，用户让我用中文简洁地解释一段代码。这段代码看起来是关于一个函数sum的定义，里面有参数a和b，返回它们的和。\n\n首先，我需要明确这段代码的基本功能。函数sum接受两个参数a和b，并将它们相加并返回结果。这听起来像是用来累加两个数的一种方式，可能用于简单计算或者数据处理中。\n\n接下来，我应该考虑用户的身份。如果我是代码分析助手，可能是想帮助开发者理解代码的功能，或者优化代码的性能。因此，解释时需要清晰、简洁，并且涵盖函数的定义、参数的作用和返回值的重要性。\n\n然后，我要检查是否有任何特殊情况需要注意。比如，是否a或b是数值类型，是否处理了非数字的情况？因为如果a或b不是数，直接相加可能会导致错误，所以应该指出这一点，帮助用户了解潜在的问题。\n\n另外，我需要确保解释符合中文的表达习惯，使用易懂的语言，避免专业术语过多。同时，要保持简洁，只点明关键部分，不冗长。\n\n最后，我会组织语言，先介绍函数sum的基本结构和功能，然后讨论它的参数含义，接着说明返回值的作用，最后提到潜在的问题处理，这样用户可以全面理解这段代码的功能和可能的应用场景。\n\u003c/think\u003e\n\n这段代码定义了一个名为`sum`的函数，并将两个参数相加并返回结果。函数的核心作用是将两个数值相加，通常用于简单的累加计算或数据汇总。需要注意的是，如果输入的参数不是数字，直接进行相加可能会导致错误，因此在使用时应对非数字类型的数据进行处理或转换。"
	//     },
	//     "done_reason": "stop",
	//     "done": true,
	//     "total_duration": 15238079407,
	//     "load_duration": 26704863,
	//     "prompt_eval_count": 39,
	//     "prompt_eval_duration": 471444524,
	//     "eval_count": 345,
	//     "eval_duration": 14738853721
	// }
	const response = await fetch(baseURL, {
		method: 'post',
		body: JSON.stringify({
			messages,
			model: model ?? 'deepseek-r1:1.5b', // deepseek-r1:7b
			temperature,
			...rest,
			stream: false,
		}),
	});

	// 如果请求失败
	if (!response.ok) {
		return null;
	}

	// {role: 'assistant', content: ''}
	const { message } = await response.json();

	return message;
}
