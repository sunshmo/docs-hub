'use client';

import { RoleType, SessionMessage, RenderCodeBlockButton } from 'docs-hub-shared-models';
import { Renderer } from '@/components/file-preview/renderer';
import MarkdownRenderer from '@/components/markdown-renderer/markdown-renderer';
import React, { useRef } from 'react';
import { useAutoScrollToBottom } from '@/hooks/use-auto-scroll2bottom';

export function ChatList({
	isLoading,
	dataSource,
	renderBlockButtons,
}: {
	isLoading?: boolean;
	dataSource: SessionMessage[];
	renderBlockButtons?: RenderCodeBlockButton;
}) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	useAutoScrollToBottom(containerRef);

	return (
		<div className="h-full overflow-y-auto" ref={containerRef}>
			<div className="flex-grow h-0">
				<div className="flex flex-col w-full pt-2 pb-2 gap-1 mx-auto max-w-[90%]">
					{dataSource.map((e, mIndex) => {
						if (e.role === RoleType.assistant) {
							return (
								<MarkdownRenderer
									key={mIndex}
									content={e.content}
									renderBlockButtons={renderBlockButtons}
								/>
							);
						}
						return (
							<div
								key={mIndex}
								className="flex flex-col empty:hidden items-end rtl:items-start"
							>
								<div className="bg-gray-200 dark:bg-gray-800 p-2 rounded-md">
									<Renderer files={e.files} />
									<div>{e.content}</div>
								</div>
							</div>
						);
					})}
					{isLoading &&
						dataSource[dataSource.length - 1]?.role !== RoleType.assistant && (
							<div className="message assistant">
								<div className="message-role">AI ...</div>
							</div>
						)}
				</div>
			</div>
		</div>
	);
}
