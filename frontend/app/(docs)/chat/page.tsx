'use client';
import { useRouter } from 'next/navigation';
import { MessageCirclePlus } from 'lucide-react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { RoleType, SessionMessage } from 'docs-hub-shared-models';

import { SessionList } from '@/components/session-list';
import { useSession } from '@/hooks/use-session';
import { ChatList } from '@/components/chat/list';
import { ChatForm } from '@/components/chat/chat-form';
import { Button } from '@/components/ui/button';
import request from '@/request';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';

const ChatApp = () => {
	const { t: tChat } = useTranslation('chat');

	const { load: loadSessions, sessionId } = useSession();
	const router = useRouter();
	const [messages, setMessages] = useState<SessionMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isJumped, setIsJumped] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const abortControllerRef = useRef<AbortController | null>(null);
	const currentReaderRef =
		useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

	// 初始化加载消息
	useEffect(() => {
		const loadMessages = async () => {
			const sessionMessages = await getSessionMessages(sessionId);
			setMessages(sessionMessages);
		};
		loadMessages();
	}, [sessionId]);

	// 自动滚动到底部
	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, []);

	const newChat = useCallback(() => {
		abortCurrentRequest(); // 中止当前请求
		router.push('/chat');
	}, [router]);

	const abortCurrentRequest = useCallback(() => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}
		if (currentReaderRef.current) {
			currentReaderRef.current.cancel().catch(() => {});
			currentReaderRef.current = null;
		}
	}, []);

	const generateChat = useCallback(
		async (params: {
			sessionId: string | null;
			attachmentIds?: string[];
			prompt?: string;
		}) => {
			const response = await request('/api/session', {
				method: 'post',
				body: JSON.stringify(params),
			});
			const result = await response.json();
			return result?.data?.id;
		},
		[],
	);

	const getSessionMessages = useCallback(async (sessionId: string | null) => {
		if (!sessionId) return [];

		try {
			const response = await request('/api/message/session-messages', {
				method: 'post',
				body: JSON.stringify({ sessionId }),
			});
			const result = await response.json();
			return Array.isArray(result?.data) ? result.data : [];
		} catch (err) {
			console.error('Failed to get session messages:', err);
			return [];
		}
	}, []);

	const onSendMessage = useCallback(
		async ({ prompt }: { prompt: string }, attachmentIds: string[] = []) => {
			let sid: string | null = null;

			setIsLoading(true);
			abortCurrentRequest(); // 先中止之前的请求

			// 创建新的会话或使用现有会话
			sid = await generateChat({
				sessionId,
				attachmentIds,
				prompt,
			});

			if (sid) {
				router.push(`/chat?sessionId=${sid}`);
				setIsJumped(true);
			}
		},
		[sessionId, router, generateChat, abortCurrentRequest],
	);

	const streamChat = async () => {
		if (!isJumped || !sessionId) {
			return;
		}
		setIsJumped(false);
		try {
			// 重新加载会话列表
			loadSessions();

			// 获取最新消息并添加用户消息
			const currentMessages = await getSessionMessages(sessionId);
			setMessages([
				...currentMessages,
				{ role: RoleType.assistant, content: '' },
			]);

			// 设置中止控制器
			abortControllerRef.current = new AbortController();

			// 发起流式请求
			const response = await request('/api/session/session-chat', {
				method: 'post',
				body: JSON.stringify({ sessionId }),
				signal: abortControllerRef.current.signal,
			});

			if (!response.body) {
				throw new Error('Response body is null');
			}

			// 设置流读取器
			currentReaderRef.current = response.body.getReader();
			if (!currentReaderRef.current) {
				return;
			}

			const decoder = new TextDecoder();
			let partialLine = '';

			while (true) {
				const { done, value } = await currentReaderRef.current.read();
				if (done) break;

				const chunk = decoder.decode(value, { stream: true });
				const lines = (partialLine + chunk).split('\n');
				partialLine = lines.pop() || '';

				for (const line of lines) {
					if (!line.trim()) continue;

					try {
						const content = JSON.parse(line);
						setMessages((prev) => {
							const lastMessage = prev[prev.length - 1];
							// 确保只添加新内容，避免重复
							if (lastMessage.role === RoleType.assistant) {
								return [
									...prev.slice(0, -1),
									{ ...lastMessage, content: lastMessage.content + content },
								];
							}
							return prev;
						});
					} catch (err) {
						console.error('Error parsing JSON:', err);
					}
				}
			}

			// 处理最后一行
			if (partialLine.trim()) {
				try {
					const content = JSON.parse(partialLine);
					setMessages((prev) => {
						const lastMessage = prev[prev.length - 1];
						if (lastMessage.role === RoleType.assistant) {
							return [
								...prev.slice(0, -1),
								{ ...lastMessage, content: lastMessage.content + content },
							];
						}
						return prev;
					});
				} catch (err) {
					console.error('Error parsing final JSON:', err);
				}
			}
		} catch (err) {
			// @ts-expect-error
			if (err?.name !== 'AbortError') {
				console.error('Error during chat:', err);
				setMessages((prev) => [
					...prev,
					{
						role: RoleType.assistant,
						content: 'Sorry, an error occurred while generating the response.',
					},
				]);
			}
		} finally {
			setIsLoading(false);
			abortControllerRef.current = null;
			currentReaderRef.current = null;
		}
	};

	useEffect(() => {
		streamChat().then(() => {});
	}, [isJumped, sessionId]);

	return (
		<div className="flex flex-row w-full">
			<div className="flex-1 flex flex-col overflow-hidden">
				<div className="flex flex-col flex-1 overflow-hidden">
					<ChatList dataSource={messages} />
					<div ref={messagesEndRef} />
				</div>

				<ChatForm
					streaming={isLoading}
					onSendMessage={onSendMessage}
					onStop={abortCurrentRequest}
					extraButton={
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button onClick={newChat}>
										<MessageCirclePlus />
									</Button>
								</TooltipTrigger>
								<TooltipContent>{tChat('newChat')}</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					}
				/>
			</div>
			<SessionList></SessionList>
		</div>
	);
};

export default ChatApp;
