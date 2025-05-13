'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ActionType, ContentType, Document } from 'docs-hub-shared-models';

import { Button } from '@/components/ui/button';
import request from '@/request';
import MarkdownRenderer from '@/components/markdown-renderer/markdown-renderer';
import { Input } from '@/components/ui/input';
import { SettingsProvider } from '@/components/editor/settings';
import { PlateEditor } from '@/components/editor/plate-editor';
import { cn } from '@/lib/utils';
import { debounce } from '@/lib/debounce';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { generateAvContent } from '@/lib/editor';
import { useTranslation } from 'react-i18next';

export function DocumentEditor({
	data,
	contentType,
	actionType,
	className,
	editorClassName,
	msgContent,
	onSuccess,
	onError,
}: {
	data?: Document | null;
	contentType?: ContentType;
	actionType?: ActionType;
	className?: string;
	editorClassName?: string;
	msgContent?: string;
	onSuccess?: () => void;
	onError?: (error: Error) => void;
}) {
	const { t: tDocument } = useTranslation('document');
	const { t: tAction } = useTranslation('action');
	const [open, onOpenChange] = useState(false);
	const documentNameRef = useRef<HTMLInputElement>(null);
	const [mdContent, setMdContent] = useState('');

	const onEditorValueChange = useCallback(
		debounce(({ editor, value }) => {
			const content = editor.api.markdown.serialize(value);
			setMdContent(content + generateAvContent(value));
		}, 100),
		[],
	);

	const initInputValue = useCallback(() => {
		if (!data?.name) return;
		if (!documentNameRef.current) return;
		documentNameRef.current.value = data.name;
	}, [data?.name]);

	useEffect(() => {
		initInputValue();
	}, []);

	return (
		<div className={cn('flex flex-col p-1', className)}>
			<div className="flex-1 overflow-y-auto relative">
				<div
					className="h-full border rounded-t-lg overflow-hidden"
					data-registry="plate"
				>
					<SettingsProvider>
						<PlateEditor
							clasName={editorClassName}
							content={msgContent}
							onValueChange={onEditorValueChange}
						/>
					</SettingsProvider>
				</div>
			</div>
			<div className="w-full pt-2 space-x-2 flex">
				<div>
					<Input ref={documentNameRef} placeholder={tDocument('inputName')} />
				</div>
				<Button onClick={() => onOpenChange(true)}>{tAction('preview')}</Button>
				<Button
					type="button"
					variant="destructive"
					onClick={() => {
						if (!documentNameRef?.current) return;
						const name = documentNameRef.current.value.trim();
						if (!name) {
							documentNameRef.current.focus();
							toast.error(tDocument('inputName'));
							return;
						}
						if (data) {
							request('/api/document', {
								method: 'put',
								body: JSON.stringify(Object.assign({
									id: data.id,
									type: contentType,
									content: mdContent || msgContent,
									name,
								})),
							})
								.then((res) => res.json())
								.then((res) => {
									if (res?.success) {
										toast.success('document update successful');
										onSuccess?.();
									} else {
										toast.error('document update failed');
									}
								})
								.catch((err) => onError?.(err));
						} else {
							request('/api/document', {
								method: 'post',
								body: JSON.stringify({
									type: contentType,
									content: mdContent || msgContent,
									name,
								}),
							})
								.then((res) => res.json())
								.then((res) => {
									if (res?.success) {
										toast.success('document generate success');
										onSuccess?.();
									} else {
										toast.error('document generate failed');
									}
								})
								.catch((err) => onError?.(err));
						}
					}}
				>
					{data?.id ? tAction('update') : tAction('generate')}
				</Button>
				{actionType === ActionType.Export && (
					<Button
						type="button"
						variant="destructive"
						onClick={() => {
							if (!documentNameRef?.current) return;
							const name = documentNameRef.current.value.trim();
							if (!name) {
								documentNameRef.current.focus();
								toast.error('Input document name');
								return;
							}
							request('/api/document/export', {
								method: 'post',
								body: JSON.stringify(Object.assign({}, data ? { id:data.id }: {},{
									type: contentType,
									content: mdContent || msgContent,
									name,
								})),
							})
								.then((res) => res.json())
								.then((res) => {
									if (res?.success) {
										toast.success('document export successful');
										onSuccess?.();
									} else {
										toast.error('document export failed');
									}
								})
								.catch((err) => onError?.(err));
						}}
					>
						{tAction('export')}
					</Button>
				)}
			</div>

			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-3xl">
					<DialogHeader>
						<DialogTitle>Preview document</DialogTitle>
					</DialogHeader>
					<div className="max-h-[70vh] overflow-y-auto">
						<MarkdownRenderer content={mdContent} />
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
