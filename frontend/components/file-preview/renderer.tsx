'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Attachment } from 'docs-hub-shared-models';

import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

const loading = () => <p>Loading...</p>;

const components = {
	image: dynamic(() => import('./image'), {
		ssr: false,
		loading,
	}),
	md: dynamic(() => import('./markdown'), {
		ssr: false,
		loading,
	}),
	markdown: dynamic(() => import('./markdown'), {
		ssr: false,
		loading,
	}),
	txt: dynamic(() => import('./markdown'), {
		ssr: false,
		loading,
	}),
	pdf: dynamic(() => import('./pdf'), {
		ssr: false,
		loading,
	}),
};

function getComponent(file: Attachment | undefined) {
	if (!file) {
		return null;
	}
	const { filename } = file;
	if (!filename) {
		return null;
	}
	const index = filename.lastIndexOf('.');
	if (index === -1) {
		return null;
	}
	const ext = filename.slice(index + 1).toLowerCase();
	// @ts-expect-error
	const Com = components[ext];
	if (!Com) {
		return null;
	}
	return Com;
}

export function Renderer({
	files,
}: {
	files?: Attachment[];
}) {
	const [open, setOpen] = useState(false);
	const [file, setFile] = useState<Attachment | undefined>();

	const Com = getComponent(file);

	return (
		<>
			{Array.isArray(files)
				? files.map((e: Attachment, index: number) => {
						return (
							<Button
								className={index !== files.length - 1 ? 'mr-2' : ''}
								key={e.id}
								onClick={() => {
									setFile(e);
									setOpen(true);
								}}
							>
								{e.filename}
							</Button>
						);
					})
				: null}
			<Drawer direction="bottom" open={open} onClose={() => setOpen(false)}>
				<DrawerContent className="w-2/4 h-2/3 mx-auto">
					<DrawerHeader>
						<DrawerTitle>{file?.filename || 'title'}</DrawerTitle>
					</DrawerHeader>
					<div className="overflow-y-auto pl-4 pr-4 pb-4">
						{Com && <Com prefix="http://localhost:3456/uploads/" {...file} />}
					</div>
				</DrawerContent>
			</Drawer>
		</>
	);
}
