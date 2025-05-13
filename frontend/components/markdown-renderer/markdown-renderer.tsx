import React, { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import CodeBlock from './code-block';
import { RenderCodeBlockButton } from 'docs-hub-shared-models';

type Props = {
	className?: string;
	content: string;
	renderBlockButtons?: RenderCodeBlockButton;
};

export const MarkdownRenderer = memo(
	({ content, renderBlockButtons }: Props) => {
		const renderers = useMemo(
			() => ({
				pre: (props: React.HTMLAttributes<HTMLPreElement>) => {
					const codeProps = Array.isArray(props.children)
						? props.children[0]?.props
						: // @ts-expect-error
							props.children?.props;
					return (
						<div className="block">
							<CodeBlock
								{...codeProps}
								renderBlockButtons={renderBlockButtons}
							/>
						</div>
					);
				},
				// code: CodeBlock,
				// @ts-expect-error
				img: ({ node, ...props }) => {
					return (
						<img
							{...props}
							style={{ maxWidth: '100%', borderRadius: '8px' }}
							loading="lazy"
						/>
					);
				},
				// @ts-expect-error
				audio: ({ node, ...props }) => {
					// debugger
					return <audio {...props} controls style={{ width: '100%' }} />;
				},
				// @ts-expect-error
				video: ({ node, ...props }) => {
					// debugger
					return (
						<video
							{...props}
							controls
							style={{ width: '100%', borderRadius: '8px' }}
						/>
					);
				},
			}),
			[],
		);

		const plugins = useMemo(
			() => ({
				remarkPlugins: [remarkGfm],
				rehypePlugins: [rehypeRaw],
			}),
			[],
		);

		return (
			<ReactMarkdown
				// @ts-expect-error
				components={renderers}
				{...plugins}
			>
				{content}
			</ReactMarkdown>
		);
	},
);

export default MarkdownRenderer;
