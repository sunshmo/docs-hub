'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { MoreHorizontal, Pencil, SquarePen, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ContentType } from 'docs-hub-shared-models';
import { useTranslation } from 'react-i18next';

import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuAction, SidebarMenuItem } from '@/components/ui/sidebar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useSession } from '@/hooks/use-session';
import request from '@/request';
import { DeleteDialog } from '@/components/delete-dialog';
import { DocumentGenerate } from '@/components/document/document-generate';

interface SessionData {
	id: string;
	name: string;
}

const defaultPosition = { left: -999999, top: -999999, height: 0 };

function SessionList({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { t: tAction } = useTranslation('action');
	const { load: loadSessions, sessionId, sessionList } = useSession();

	const [inputValue, setInputValue] = useState('');
	const [selectedData, setSelectedData] = useState<SessionData>();

	const [deleteVisible, setDeleteVisible] = useState(false);
	const [generateDialogVisible, setGenerateDialogVisible] = useState(false);
	const [rect, setRect] = useState(defaultPosition);

	const router = useRouter();

	useEffect(() => {
		loadSessions();
	}, []);

	const updatePosition = useCallback(() => {
		if (!selectedData) return;
		const el = document.querySelector(`[data-position-id="${selectedData.id}"]`);
		if (!el) return;
		const { left, top, width, height } = el.getBoundingClientRect();
		const parent = el.parentElement;
		let pRect;
		if (parent) {
			pRect = parent.getBoundingClientRect();
		}
		setRect({ left, top: pRect?.top || top, height: pRect?.height || height });
	}, [selectedData]);

	useEffect(() => {
		updatePosition();
	}, [selectedData]);

	return (
		<Sidebar
			collapsible="none"
			className="sticky hidden lg:flex top-0 h-[calc(100svh-64px)] border-l"
			{...props}
		>
			<SidebarContent>
				<SidebarMenu className="relative">
					{Array.isArray(sessionList)
						? sessionList.map((data, index) => {
							return (
								<SidebarMenuItem
									key={index}
									className={cn({
										'bg-sidebar-border': sessionId == String(data.id),
									})}
								>
									<div
										className="flex justify-between cursor-pointer pl-2 pr-2 w-full items-center rounded-md h-8 text-sm">
										<div
											className="overflow-hidden pr-6 flex-1 flex items-center h-full"
											onClick={() => {
												setSelectedData(undefined);
												router.push(`/chat?sessionId=${data.id}`);
											}}
										>
											<div className="truncate" data-position-id={data.id}>
												{data.name}
											</div>
										</div>

										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<SidebarMenuAction showOnHover>
													<MoreHorizontal />
													<span className="sr-only">More</span>
												</SidebarMenuAction>
											</DropdownMenuTrigger>
											<DropdownMenuContent className="w-48 rounded-lg">
												<DropdownMenuItem
													onClick={() => {
														setSelectedData(data);
														setGenerateDialogVisible(true);
													}}
												>
													<SquarePen className="text-muted-foreground" />
													<span>{tAction('generate')}</span>
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													onClick={() => {
														setInputValue(data.name);
														setSelectedData(data);
													}}
												>
													<Pencil className="text-muted-foreground" />
													<span>{tAction('rename')}</span>
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													onClick={() => {
														setSelectedData(data);
														setDeleteVisible(true);
													}}
													className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
												>
													<Trash2 className="text-muted-foreground" />
													<span>{tAction('delete')}</span>
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</SidebarMenuItem>
							);
						})
						: null}
				</SidebarMenu>

				<input
					value={inputValue}
					onChange={(event) => {
						setInputValue(event.target.value);
					}}
					onBlur={(event) => {
						const { target } = event;
						const { value } = target;
						if (
							value.trim() !== selectedData?.name &&
							selectedData?.id
						) {
							request('/api/session', {
								method: 'put',
								body: JSON.stringify({
									id: selectedData.id,
									name: value,
								}),
							})
								.then((res) => {
									loadSessions();
								})
								.finally(() => {
									setRect(defaultPosition);
									setSelectedData(undefined);
								});
						}
					}}
					className="fixed"
					style={rect}
				/>

				<DeleteDialog
					input="/api/session"
					open={deleteVisible}
					onOpenChange={() => setDeleteVisible(false)}
					onClose={() => setSelectedData(undefined)}
					body={JSON.stringify({
						ids: [selectedData?.id],
					})}
					onSuccess={loadSessions}
					onFinally={() => {
						setSelectedData(undefined);
						router.push('/chat');
					}}
				/>

				<DocumentGenerate
					contentType={ContentType.chat}
					open={generateDialogVisible}
					onOpenChange={setGenerateDialogVisible}
					onSuccess={() => {
						setGenerateDialogVisible(false);
					}}
				/>
			</SidebarContent>
		</Sidebar>
	);
}

export { SessionList };
