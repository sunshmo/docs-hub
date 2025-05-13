'use client';

import * as React from 'react';
import {
	BookText,
	Bot,
	FolderPen,
	// Gauge,
	MessagesSquare,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from '@/components/ui/sidebar';
import i18n from '@/i18n';
import { useTranslation } from 'react-i18next';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { t: tMenu } = useTranslation('menu');
	const navMain = [
		{
			title: tMenu('chat'),
			url: '/chat',
			icon: MessagesSquare,
		},
		{
			title: tMenu('document'),
			url: '/document',
			icon: BookText,
		},
		// {
		// 	title: 'Dashboard',
		// 	url: '/dashboard',
		// 	icon: Gauge,
		// },
		{
			title: tMenu('model'),
			url: '/model',
			icon: Bot,
		},
	];

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher
					teams={[
						{
							name: 'Docs Hub Inc',
							logo: FolderPen,
							plan: 'Enterprise',
						},
					]}
				/>
			</SidebarHeader>
			<SidebarContent>
				<NavMain dataSource={navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
