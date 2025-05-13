'use client';

import React, { useState } from 'react';
import { ActionType, ContentType, Document } from 'docs-hub-shared-models';

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentChat } from '@/components/document/chat';
import { DocumentCrawler } from '@/components/document/crawler';
import { useTranslation } from 'react-i18next';

export function DocumentGenerate({
	data,
	contentType,
	actionType,
	defaultValue,
	open,
	onOpenChange,
	onSuccess,
	onError,
}: {
	data?: Document | null;
	contentType?: ContentType;
	actionType?: ActionType,
	defaultValue?: string;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onSuccess?: () => void;
	onError?: (error: Error) => void;
}) {
	const { t: tDocument } = useTranslation('document');
	const [tab, setTab] = useState<ContentType>(contentType || ContentType.chat);

	// @ts-expect-error
	const disabled = [ContentType.chat, ContentType.crawler].includes(contentType);

	const tabsTrigger = [
		{ value: ContentType.chat, label: tDocument('chat'), disabled },
		{ value: ContentType.crawler, label: tDocument('crawler'), disabled },
		// { value: ContentType.write, disabled },
	];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-5xl">
				<DialogHeader>
					<DialogTitle>{tDocument('title')}</DialogTitle>
				</DialogHeader>
				<div className="overflow-hidden">
					<Tabs
						value={tab}
						onValueChange={(val) => setTab(val as ContentType)}
						defaultValue={ContentType.chat}
						className="w-full"
					>
						<TabsList className="grid w-full grid-cols-2">
							{tabsTrigger.map(el => {
								return (
									<TabsTrigger key={el.value} value={el.value} disabled={el.disabled}>
										{el.label}
									</TabsTrigger>
								);
							})}
						</TabsList>

						<TabsContent value={ContentType.chat}>
							<DocumentChat
								data={data}
								contentType={contentType}
								actionType={actionType}
								defaultValue={defaultValue}
								onSuccess={onSuccess}
								onError={onError}
							/>
						</TabsContent>
						<TabsContent value={ContentType.crawler}>
							<DocumentCrawler
								data={data}
								contentType={contentType}
								actionType={actionType}
								defaultValue={defaultValue}
								onSuccess={onSuccess}
								onError={onError}
							/>
						</TabsContent>
					</Tabs>
				</div>
			</DialogContent>
		</Dialog>
	);
}
