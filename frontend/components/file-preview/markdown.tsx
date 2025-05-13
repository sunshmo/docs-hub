import React, { memo, Suspense, useEffect, useState } from 'react';

import { MarkdownRenderer } from '@/components/markdown-renderer/markdown-renderer';
import request from '@/request';
import { Attachment } from 'docs-hub-shared-models';

interface IProps extends Attachment {
	prefix: string;
	className?: string;
	[prop: string]: unknown;
}

export default memo(function ({ prefix, id, className }: IProps) {
	const [loading, setLoading] = useState(true);
	const [content, setContent] = useState('');

	function getContent() {
		request('/api/attachment/extract', {
			method: 'post',
			body: JSON.stringify({
				id,
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				setContent(res.data);
			})
			.finally(() => {
				setLoading(false);
			});
	}

	useEffect(() => {
		getContent();
	}, []);

	if (loading) {
		return null;
	}

	return (
		<Suspense>
			<MarkdownRenderer className={className} content={content} />
		</Suspense>
	);
});
