import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import React from 'react';
import request from '@/request';
import { ResponseStruct } from 'docs-hub-shared-models';

export function DeleteDialog({
	input,
	body,
	title = '确认删除',
	description = '删除会数据将丢失，不可恢复',
	open,
	onOpenChange,
	onClose,
	onSuccess,
	onFailed,
	onError,
	onFinally,
}: {
	input: string;
	body: BodyInit | null;
	open: boolean;
	onOpenChange: (visible: boolean) => void;
	title?: string;
	description?: string;
	onClose?: () => void;
	onSuccess?: (res: ResponseStruct) => void;
	onError?: (err: Error) => void;
	onFailed?: (res: ResponseStruct) => void;
	onFinally?: () => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						type="button"
						variant="destructive"
						onClick={() => {
							if (!input) {
								return;
							}
							request(input, {
								method: 'delete',
								body,
							})
								.then((res) => res.json())
								.then((res) => {
									if (res?.success) {
										onSuccess?.(res);
									} else {
										onFailed?.(res);
									}
								})
								.catch(onError)
								.finally(() => {
									onClose?.();
									onFinally?.();
								});
						}}
					>
						确认
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
