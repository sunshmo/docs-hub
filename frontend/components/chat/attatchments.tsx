import { Attachment } from 'docs-hub-shared-models';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { MouseEvent } from 'react';
import request from '@/request';

export function Attachments({
	dataSource,
	onDeleteSuccess,
	onError,
	onFinally,
}: {
	dataSource: Attachment[];
	onDeleteSuccess?: (data: Attachment, success: boolean) => void;
	onError?: (error: Error) => void;
	onFinally?: () => void;
}) {
	return (
		<div className="text-sm pt-2">
			{dataSource.map((el, index) => {
				return (
					<Badge
						variant="secondary"
						key={el.id}
						className={cn('relative', {
							'mr-2': index !== dataSource.length - 1,
						})}
					>
						{el.filename}
						<X
							className="w-3 h-3 absolute ml-2 text-sm bg-gray-200 text-gray-50 cursor-pointer rounded-full hover:bg-gray-950 hover:text-white"
							style={{ top: -5, right: -5 }}
							onClick={(event: MouseEvent) => {
								event.stopPropagation();
								request('/api/attachment', {
									method: 'delete',
									body: JSON.stringify({
										ids: [el.id],
									}),
								})
									.then((res) => res.json())
									.then((res) => res?.data)
									.then((res) => {
										if (typeof onDeleteSuccess === 'function') {
											onDeleteSuccess(el, res);
										}
									})
									.catch((error: Error) => {
										if (typeof onError === 'function') {
											onError(error);
										}
									})
									.finally(onFinally);
							}}
						/>
					</Badge>
				);
			})}
		</div>
	);
}
