'use client';

import React, { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Plate } from '@udecode/plate/react';

import { useCreateEditor } from '@/components/editor/use-create-editor';
import { SettingsDialog } from '@/components/editor/settings';
import { Editor, EditorContainer } from '@/components/plate-ui/editor';

export function PlateEditor({
	clasName,
	content,
	onValueChange,
}: {
	clasName?: string;
	content?: string;
	// @ts-expect-error
	onValueChange?: ({ editor: any, value: any }) => void;
}) {
	const editor = useCreateEditor();

	useEffect(() => {
		// @ts-expect-error parse markdown to nodes
		editor.insertNodes(editor.api.markdown.deserialize(content));
	}, [content, editor]);

	return (
		<DndProvider backend={HTML5Backend}>
			<Plate editor={editor} onValueChange={onValueChange}>
				<EditorContainer className={clasName}>
					<Editor variant="demo" />
				</EditorContainer>

				<SettingsDialog />
			</Plate>
		</DndProvider>
	);
}
