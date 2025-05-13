'use client';

import React, { useCallback, useState, memo, forwardRef, useRef } from 'react';
import { Attachment } from 'docs-hub-shared-models';
import { useDropzone } from 'react-dropzone';
import request from '@/request';
import { cn } from '@/lib/utils';

interface UploadProps extends React.HTMLAttributes<HTMLDivElement> {
	url?: string;
	extraParams?: Promise<Record<string, any>> | Record<string, any>;
	onUploadSuccess?: (files: Attachment[]) => void; // 自定义回调
}

const Upload = memo(
	forwardRef<HTMLDivElement, UploadProps>((props, ref) => {
		const { url, extraParams, className, onUploadSuccess, ...rest } = props;

		const fileRef = useRef<HTMLInputElement>(null);
		const [uploading, setUploading] = useState(false);

		const onDrop = useCallback(async (files: File[]) => {
			if (!files.length) {
				return;
			}

			setUploading(true);
			const formData = new FormData();
			for (const file of files) {
				formData.append('files', file);
			}

			if (extraParams) {
				// extra params
				let params: Record<string, any> | undefined = extraParams;
				if (typeof extraParams === 'function') {
					params = await extraParams();
				}
				for (const key in params) {
					formData.append(key, params[key]);
				}
			}

			try {
				if (!url) return;
				const res = await request(url, {
					method: 'post',
					body: formData,
				});

				const data = await res.json();

				if (typeof onUploadSuccess === 'function') {
					onUploadSuccess(data.data);
				}
				console.log('Upload success:', res);
			} catch (error) {
				console.error('Upload failed:', error);
			} finally {
				fileRef.current!.value = '';
				setUploading(false);
			}
		}, []);

		const { getRootProps, getInputProps } = useDropzone({ onDrop });

		return (
			<div className={cn('hidden', className)} {...rest} {...getRootProps()}>
				<input {...getInputProps()} ref={fileRef} className="hidden" />
			</div>
		);
	}),
);

export { Upload };
