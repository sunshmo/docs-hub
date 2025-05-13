'use client';

import { ReactNode, useCallback, useState } from 'react';
import { Attachment } from 'docs-hub-shared-models';
import { CircleStop, Paperclip, Send } from 'lucide-react';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload } from '@/components/upload';
import { Attachments } from '@/components/chat/attatchments';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';

interface IProps {
	streaming?: boolean;
	onSendMessage?: (
		{ prompt }: { prompt: string },
		attachmentIds: string[],
	) => Promise<void>;
	onStop?: (() => void) | undefined;
	extraButton?: ReactNode; // new chat
}

export function ChatForm(props: IProps) {
	const { t: tChat } = useTranslation('chat');

	const { streaming, onSendMessage, onStop, extraButton } = props;

	const [fileList, setFileList] = useState<Attachment[]>([]);
	const [inputValue, setInputValue] = useState('');

	async function onSubmit() {
		const prompt = inputValue.trim();
		const canSubmit = inputValue.trim() || fileList?.length;
		if (!canSubmit) {
			return;
		}
		const attachmentIds = fileList.map((e) => e.id);
		setFileList([]);
		setInputValue('');

		if (typeof onSendMessage === 'function') {
			await onSendMessage({ prompt }, attachmentIds);
		}
	}

	const onUploadSuccess = useCallback((list: Attachment[]) => {
		setFileList(Array.isArray(list) ? list : []);
	}, []);

	function onDeleteSuccess(data: Attachment) {
		setFileList((prevState) => {
			const nextList = prevState.slice();
			const index = nextList.findIndex((ele: Attachment) => data.id === ele.id);
			if (index !== -1) {
				nextList.splice(index, 1);
			}
			return prevState;
		});
	}

	const canSend = inputValue.trim() || fileList?.length;

	return (
		<div className="w-full md:max-w-xl mx-auto p-4 space-y-4">
			<Textarea
				value={inputValue}
				onChange={(event) => {
					setInputValue(event.target.value);
				}}
				placeholder={tChat('placeholder')}
				className="flex-1 resize-none border rounded-md p-2"
				style={{ height: 100 }}
			/>
			<div className="w-full">
				<div className="flex justify-between">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="secondary">
									<Label className="cursor-pointer">
										<Upload
											url="/api/attachment"
											onUploadSuccess={onUploadSuccess}
										/>
										<Paperclip />
									</Label>
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								{tChat('uploadTip')}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<div className="space-x-2 flex">
						{extraButton}
						{canSend ? (
							<Button onClick={onSubmit}>
								<Send />
							</Button>
						) : (
							!streaming && (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="cursor-not-allowed">
												<Button disabled={!canSend}>
													<Send />
												</Button>
											</div>
										</TooltipTrigger>
										<TooltipContent>{tChat('tip')}</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							)
						)}
						{streaming && (
							<Button onClick={onStop}>
								<CircleStop />
							</Button>
						)}
					</div>
				</div>
				<Attachments
					dataSource={fileList}
					onDeleteSuccess={onDeleteSuccess}
				/>
			</div>
		</div>
	);
}
