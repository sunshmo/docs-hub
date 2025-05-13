// 预览pdf
import * as React from 'react';
import { cn } from '@/lib/utils';

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
	destName?: string;
	[prop: string]: unknown;
}

const Pdf = React.forwardRef<
	HTMLIFrameElement,
	React.DetailedHTMLProps<
		React.IframeHTMLAttributes<HTMLIFrameElement>,
		HTMLIFrameElement
	>
>(({ className, destName, prefix }: IProps, ref) => {
	return (
		<iframe
			className={cn('border-0 min-h-80 w-full')}
			src={`${prefix}${destName}`}
		></iframe>
	);
});

export default Pdf;
