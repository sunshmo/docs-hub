import { ActionType, ContentType, Document, Message } from 'docs-hub-shared-models';
import { cn } from '@/lib/utils';
import { MultiSelect } from '@/components/multi-select';
import { Button } from '@/components/ui/button';
import { DocumentEditor } from '@/components/document/document-editor';
import React, { useEffect, useRef, useState } from 'react';
import request from '@/request';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSession } from '@/hooks/use-session';
import { useTranslation } from 'react-i18next';

export function DocumentChat({
	data,
	contentType,
	actionType,
	defaultValue,
	onSuccess,
	onError,
}: {
	data?: Document | null;
	contentType?: ContentType;
	actionType: ActionType | undefined;
	defaultValue?: string;
	onSuccess?: () => void;
	onError?: (error: Error) => void;
}) {
	const { t: tDocument } = useTranslation('document');
	const { t: tAction } = useTranslation('action');
	const isMobile = useIsMobile();
	const { sessionList, load: loadSessions } = useSession();

	const msgRef = useRef<Record<string, string>>({});
	const [selections, setSelections] = useState<string[]>([]);
	const [msgContent, setMsgContent] = useState('');

	useEffect(() => {
		setMsgContent(defaultValue || '');
	}, [defaultValue]);

	useEffect(() => {
		loadSessions();
	}, []);

	async function onQuerySessionMessage() {
		if (!selections.length) return;
		for (const id of selections) {
			try {
				const response = await request('/api/message/session-messages', {
					method: 'post',
					body: JSON.stringify({
						sessionId: id,
					}),
				});
				const { data } = await response.json();
				if (!msgRef.current[id]) {
					msgRef.current[id] = '';
				}
				msgRef.current[id] += data.map((e: Message) => e.content).join('\n');
			} catch (err) {
				console.error(err);
			}
		}
		setMsgContent(
			Object.keys(msgRef.current)
				.map((key) => msgRef.current[key])
				.join('\n'),
		);
	}

	const options = sessionList.map((e) => {
		return {
			...e,
			label: e.name,
			value: e.id,
		};
	});

	return (
		<div className="overflow-y-auto">
			<div>{tDocument('tip')}</div>
			<div className="text-cyan-100 italic">{tDocument('description')}</div>
			<div className={cn('flex mb-2', { 'flex-col': isMobile })}>
				<div className={cn(isMobile ? '' : 'flex-1 mr-4', 'overflow-hidden')}>
					<MultiSelect
						options={options}
						selectedValues={selections}
						onSelect={setSelections}
						placeholder={tDocument('selectItems')}
						searchPlaceholder={tDocument('selectItems')}
						emptyText={tDocument('emptyText')}
						className="w-full"
					/>
					<div
						className={cn('mt-1 text-sm text-gray-500', { 'mb-2': isMobile })}
					>
						{tDocument('selectPrefix')}{selections.length} {tDocument('selectSuffix')}
					</div>
				</div>
				<Button onClick={onQuerySessionMessage}>{tAction('query')}</Button>
			</div>
			<DocumentEditor
				data={data}
				contentType={contentType}
				actionType={actionType}
				editorClassName="max-h-[300px]"
				className="overflow-hidden flex-1"
				msgContent={msgContent}
				onSuccess={onSuccess}
			/>
		</div>
	);
}
