import { useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { ChevronDown, ChevronUp, Copy, CopyCheck } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import { loadPrismLang } from './load-prism-lang';
import { RenderCodeBlockButton } from 'docs-hub-shared-models';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';

interface IProps {
	className?: string;
	children?: ReactNode;
	renderBlockButtons?: RenderCodeBlockButton;
}

const CodeBlock = ({
	className = '',
	children,
	renderBlockButtons,
}: IProps) => {
	const [html, setHtml] = useState('');
	const [copied, setCopied] = useState(false);
	const [collapsed, setCollapsed] = useState(false);

	const rawCode = String(children).trim();
	const language = className.replace('language-', '') || 'plain';

	const highlight = useCallback(async () => {
		await loadPrismLang(language);
		const grammar = Prism.languages[language] || Prism.languages.plain;
		const highlighted = Prism.highlight(rawCode, grammar, language);
		setHtml(highlighted);
	}, [language, rawCode]);

	useEffect(() => {
		highlight().then();
	}, [highlight]);

	const handleCopy = () => {
		navigator.clipboard.writeText(rawCode).then();
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<span className="relative my-4 text-sm">
			<span className="sticky top-0 z-10 flex justify-between items-center rounded-tl-md rounded-tr-md p-2 bg-[#3e3e3e] text-gray-400 text-xs font-mono shadow-md">
				<span>{language}</span>
				<span className="space-x-2 flex">
					<button
						className="text-xs text-gray-500 hover:text-gray-300"
						onClick={() => setCollapsed(!collapsed)}
					>
						{collapsed ? (
							<ChevronDown className="w-4" />
						) : (
							<ChevronUp className="w-4" />
						)}
					</button>
					<button
						className="text-xs text-gray-500 hover:text-gray-300"
						onClick={handleCopy}
					>
						{copied ? (
							<CopyCheck className="w-4" />
						) : (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<Copy className="w-4" />
									</TooltipTrigger>
									<TooltipContent>Copy code</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						)}
					</button>
					{typeof renderBlockButtons === 'function' &&
						renderBlockButtons(rawCode, language)}
				</span>
			</span>

			{!collapsed && (
				<pre className="rounded-bl-md rounded-br-md border overflow-x-auto overflow-y-auto p-3 max-h-[300px]">
					<code dangerouslySetInnerHTML={{ __html: html }} />
				</pre>
			)}
		</span>
	);
};

export default CodeBlock;
