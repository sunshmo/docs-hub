'use client';

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Attachment } from 'docs-hub-shared-models';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import { MarkdownPlugin } from '@udecode/plate-markdown';
import { useEditorRef } from '@udecode/plate/react';
import { ArrowUpToLineIcon } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload } from '@/components/upload';
import request from '@/request';

export function ImportToolbarButton({ children, ...props }: DropdownMenuProps) {
	const { t: tEditor } = useTranslation('editor');
	const editor = useEditorRef();

	const insertNodes = (text: string) => {
		return editor.tf.insertNodes(editor.getApi(MarkdownPlugin).markdown.deserialize(text));
	};

	const onUploadSuccess = useCallback((list: Attachment[]) => {
		request('/api/attachment/extract', {
			method: 'post',
			body: JSON.stringify({
				ids: list.map(e => e.id),
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				insertNodes(res.data);
			});
	}, []);

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="secondary">
						<Label className="cursor-pointer">
							<Upload
								url="/api/attachment"
								onUploadSuccess={onUploadSuccess}
							/>
							<ArrowUpToLineIcon className="size-4" />
						</Label>
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<div className="text-sm">{tEditor('uploadTip')}</div>
					<div>{tEditor('fileExtDoc')}</div>
					<div>{tEditor('fileExtAudio')}</div>
					<div>{tEditor('fileExtVideo')}</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

// 'use client';
//
// import React from 'react';
//
// import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
//
// import { getEditorDOMFromHtmlString } from '@udecode/plate';
// import { MarkdownPlugin } from '@udecode/plate-markdown';
// import { useEditorRef } from '@udecode/plate/react';
// import { ArrowUpToLineIcon } from 'lucide-react';
// import { useFilePicker } from 'use-file-picker';
//
// import {
// 	DropdownMenu,
// 	DropdownMenuContent,
// 	DropdownMenuGroup,
// 	DropdownMenuItem,
// 	DropdownMenuTrigger,
// 	useOpenState,
// } from './dropdown-menu';
// import { ToolbarButton } from './toolbar';
//
// type ImportType = 'html' | 'markdown';
//
// export function ImportToolbarButton({ children, ...props }: DropdownMenuProps) {
// 	const editor = useEditorRef();
// 	const openState = useOpenState();
//
// 	const getFileNodes = (text: string, type: ImportType) => {
// 		if (type === 'html') {
// 			const editorNode = getEditorDOMFromHtmlString(text);
// 			const nodes = editor.api.html.deserialize({
// 				element: editorNode,
// 			});
//
// 			return nodes;
// 		}
//
// 		if (type === 'markdown') {
// 			return editor.getApi(MarkdownPlugin).markdown.deserialize(text);
// 		}
//
// 		return [];
// 	};
//
// 	const { openFilePicker: openMdFilePicker } = useFilePicker({
// 		accept: ['.md', '.mdx'],
// 		multiple: false,
// 		onFilesSelected: async ({ plainFiles }) => {
// 			const text = await plainFiles[0].text();
//
// 			const nodes = getFileNodes(text, 'markdown');
//
// 			editor.tf.insertNodes(nodes);
// 		},
// 	});
//
// 	const { openFilePicker: openHtmlFilePicker } = useFilePicker({
// 		accept: ['text/html'],
// 		multiple: false,
// 		onFilesSelected: async ({ plainFiles }) => {
// 			const text = await plainFiles[0].text();
//
// 			const nodes = getFileNodes(text, 'html');
//
// 			editor.tf.insertNodes(nodes);
// 		},
// 	});
//
// 	return (
// 		<DropdownMenu modal={false} {...openState} {...props}>
// 			<DropdownMenuTrigger asChild>
// 				<ToolbarButton pressed={openState.open} tooltip="Import" isDropdown>
// 					<ArrowUpToLineIcon className="size-4" />
// 				</ToolbarButton>
// 			</DropdownMenuTrigger>
//
// 			<DropdownMenuContent align="start">
// 				<DropdownMenuGroup>
// 					<DropdownMenuItem
// 						onSelect={() => {
// 							openHtmlFilePicker();
// 						}}
// 					>
// 						Import from HTML
// 					</DropdownMenuItem>
//
// 					<DropdownMenuItem
// 						onSelect={() => {
// 							openMdFilePicker();
// 						}}
// 					>
// 						Import from Markdown
// 					</DropdownMenuItem>
// 				</DropdownMenuGroup>
// 			</DropdownMenuContent>
// 		</DropdownMenu>
// 	);
// }
