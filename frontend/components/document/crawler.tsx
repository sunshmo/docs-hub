'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ActionType, ContentType, Document } from 'docs-hub-shared-models';

import request from '@/request';
import { Button } from '@/components/ui/button';
import { DocumentEditor } from '@/components/document/document-editor';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

interface IFormValues {
	url: string;
}

export function DocumentCrawler({
	data,
	contentType,
	actionType,
	defaultValue,
	onSuccess,
	onError,
}: {
	data: Document | null | undefined;
	contentType?: ContentType;
	actionType?: ActionType;
	defaultValue?: string;
	onSuccess?: () => void;
	onError?: (error: Error) => void;
}) {
	const { t: tDocument } = useTranslation('document');

	const [text, setText] = useState('');

	const form = useForm<IFormValues>({
		defaultValues: {
			url: '',
		},
	});

	async function getPageText(values: IFormValues) {
		const { url } = values;

		if (!url) {
			toast.error('Input url');
			return;
		}
		const response = await request('/api/crawler/dynamic', {
			method: 'post',
			body: JSON.stringify({
				url,
			}),
		});

		const { data } = await response.json();
		setText(data);
	}

	return (
		<div className="overflow-y-auto">
			<div>{tDocument('crawlerTip')}</div>
			<div className="flex pb-2 space-x-2">
				<Form {...form}>
					<FormField
						control={form.control}
						name="url"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input
										{...field}
										placeholder={tDocument('crawlerUrl')}
										className="flex-1 resize-none border rounded-md"
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				</Form>
				<Button onClick={form.handleSubmit(getPageText)}>{tDocument('crawler')}</Button>
			</div>
			<DocumentEditor
				data={data}
				contentType={contentType}
				actionType={actionType}
				editorClassName="max-h-[300px]"
				className="overflow-hidden flex-1"
				msgContent={`${defaultValue || ''}\n${text}`}
				onSuccess={onSuccess}
				onError={onError}
			/>
		</div>
	);
}
