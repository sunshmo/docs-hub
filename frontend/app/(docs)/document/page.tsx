'use client';

import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as VTable from '@visactor/vtable';
import * as VTable_editors from '@visactor/vtable-editors';
import { ActionType, ContentType, Document, ResponseData } from 'docs-hub-shared-models';
import { toast } from 'sonner';

import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import VListTable from '@/components/table/list-table';
import request from '@/request';
import { DeleteDialog } from '@/components/delete-dialog';
import { DocumentGenerate } from '@/components/document/document-generate';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { BookPlus, Download, FilePlus2, MessageCirclePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';

interface IFormValues {
	name: string;
	username: string;
	updateUsername: string;
}

// 官网编辑器中将 VTable.editors重命名成了VTable_editors
const input_editor = new VTable_editors.InputEditor();
VTable.register.editor('input-editor', input_editor);

export default function () {
	const { t: tDocument } = useTranslation('document');
	const { t: tAction } = useTranslation('action');

	const isMobile = useIsMobile();
	const tableRef = useRef<typeof VListTable>(null);

	const [deleteVisible, setDeleteVisible] = useState(false);
	const [cellData, setCellData] = useState<Document | null>(null);
	const [generateDialogVisible, setGenerateDialogVisible] = useState(false);
	const [actionType, setActionType] = useState<ActionType | undefined>();

	function loadTableData(params?: BodyInit | ResponseData) {
		// @ts-expect-error
		tableRef.current.load(params);
	}

	// 1. Define your form.
	const form = useForm({
		defaultValues: {
			name: '',
			username: '',
			updateUsername: '',
		},
	});

	// 2. Define a submit handler.
	async function onQuery(values: IFormValues) {
		// form.reset();
		if (!tableRef.current) return;
		loadTableData(values);
	}

	return (
		<div className="flex flex-col w-full gap-4 p-4">
			<div
				className={cn('flex space-2 gap-2', {
					'flex-wrap': !isMobile,
					'flex-col': isMobile,
				})}
			>
				<Form {...form}>
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input
										{...field}
										placeholder={tDocument('documentName')}
										className={cn('flex-1 resize-none border rounded-md', {
											'w-2xl': !isMobile,
											'w-full': isMobile,
										})}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="username"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input
										{...field}
										placeholder={tDocument('username')}
										className={cn('flex-1 resize-none border rounded-md', {
											'w-2xl': !isMobile,
											'w-full': isMobile,
										})}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="updateUsername"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input
										{...field}
										placeholder={tDocument('updateUsername')}
										className={cn('flex-1 resize-none border rounded-md', {
											'w-2xl': !isMobile,
											'w-full': isMobile,
										})}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				</Form>

				<Button onClick={form.handleSubmit(onQuery)}>{tAction('query')}</Button>

				<Button onClick={() => form.reset()}>{tAction('reset')}</Button>

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								onClick={() => {
									setActionType(ActionType.Add);
									setGenerateDialogVisible(true);
								}}
							>
								<BookPlus />
								{tAction('generate')}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							{tDocument('generateTip')}
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<Button
					onClick={() => {
						setActionType(ActionType.Export);
						setGenerateDialogVisible(true);
					}}
				>
					<Download />
					{tAction('export')}
				</Button>
			</div>
			<div className="flex-1 flex">
				<VListTable
					className="flex-1"
					url="/api/document/condition"
					ref={tableRef}
					columns={[
						{ field: 'name', title: tDocument('documentName'), editor: 'input-editor' },
						{ field: 'content', title: tDocument('documentContent') },
						{ field: 'username', title: tDocument('documentUsername') },
						{ field: 'updateUsername', title: tDocument('documentUpdateUsername') },
						{ field: 'createdAt', title: tDocument('documentCreatedAt') },
						{ field: 'updatedAt', title: tDocument('documentUpdatedAt') },
						{
							title: tAction('actions'),
							width: 80,
							// @ts-expect-error
							fixed: 'right',
							icon: [
								{
									name: 'edit',
									type: 'svg',
									positionType: VTable.TYPES.IconPosition.left,
									width: 20,
									height: 20,
									svg: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/edit.svg',
									tooltip: {
										style: { arrowMark: true },
										// 气泡框，按钮的的解释信息
										title: tAction('edit'),
										placement: VTable.TYPES.Placement.right,
									},
								},
								{
									name: 'delete',
									type: 'svg',
									marginLeft: 10,
									positionType: VTable.TYPES.IconPosition.left,
									width: 20,
									height: 20,
									svg: 'https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/delete.svg',
									tooltip: {
										style: { arrowMark: true },
										// 气泡框，按钮的的解释信息
										title: tAction('delete'),
										placement: VTable.TYPES.Placement.right,
									},
								},
							],
						},
					]}
					options={{
						rightFrozenColCount: 1,
					}}
					onGetInstance={(instance) => {
						instance.on('click_cell', (args: any) => {
							const { originData, targetIcon } = args;
							setCellData(originData);
							if (targetIcon) {
								if (targetIcon.name === 'edit') {
									setActionType(ActionType.Edit);
									setGenerateDialogVisible(true);
								} else if (targetIcon.name === 'delete') {
									setDeleteVisible(true);
								}
							}
						});
						instance.on('change_cell_value', (data) => {
							const { changedValue, currentValue, col, row } = data;
							const originData = instance.getCellOriginRecord(col, row);
							if (!originData) return;
							request('/api/document', {
								method: 'put',
								body: JSON.stringify({
									name:
										typeof changedValue === 'string'
											? changedValue.trim()
											: changedValue,
									id: originData.id,
								}),
							})
								.then((res) => res.json())
								.then((res) => {
									if (res?.success) {
										toast.success(tAction('updatedSuccess'));
										loadTableData();
									} else {
										toast.error(tAction('updatedFailed'));
									}
								})
								.finally(() => {
									setCellData(null);
								});
						});
					}}
				/>
			</div>

			<DeleteDialog
				input="/api/document"
				open={deleteVisible}
				onOpenChange={() => setDeleteVisible(false)}
				body={JSON.stringify({
					ids: [cellData?.id],
				})}
				onSuccess={loadTableData}
				onFinally={() => {
					setCellData(null);
					setDeleteVisible(false);
				}}
			/>

			<DocumentGenerate
				data={cellData}
				contentType={cellData?.type as ContentType}
				actionType={actionType}
				defaultValue={cellData?.content}
				open={generateDialogVisible}
				onOpenChange={setGenerateDialogVisible}
				onSuccess={() => {
					loadTableData(form.getValues());
					setCellData(null);
					setActionType(undefined);
					setGenerateDialogVisible(false);
				}}
			/>
		</div>
	);
}
