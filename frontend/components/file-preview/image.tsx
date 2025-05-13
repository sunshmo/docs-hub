// 预览图片
import * as React from 'react';

import { cn } from '@/lib/utils';

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
	images?: React.DetailedHTMLProps<
		React.ImgHTMLAttributes<HTMLImageElement>,
		HTMLImageElement
	>[];
}

const Image = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>((options: IProps, ref) => {
	const { className, images, ...props } = options;

	return (
		<div
			ref={ref}
			className={cn('rounded-xl border shadow', className)}
			{...props}
		>
			{Array.isArray(images)
				? images.map((el, index) => {
						return <img key={index} {...el} src={el.src} alt={el.alt} />;
					})
				: null}
		</div>
	);
});
Image.displayName = 'Image';

export default Image;
