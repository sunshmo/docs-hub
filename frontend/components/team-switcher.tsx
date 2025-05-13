'use client';

import * as React from 'react';
import {
	BookOpen,
	Check,
	ChevronsUpDown,
	Plus,
	type LucideIcon,
} from 'lucide-react';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '@/components/ui/sidebar';
import { memo, useEffect, useState } from 'react';

export const TeamSwitcher = memo(
	({
		teams,
	}: {
		teams: {
			isActive?: boolean;
			title?: string;
			plan?: string;
			name: string;
			logo: LucideIcon;
			children?: { title: string; name: string; url: string }[];
		}[];
	}) => {
		const { isMobile } = useSidebar();
		const [activeTeam, setActiveTeam] = useState(teams[0]);

		if (!activeTeam) {
			return null;
		}

		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
									<activeTeam.logo className="size-4" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">
										{activeTeam.name}
									</span>
								</div>
								<ChevronsUpDown className="ml-auto" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
							align="start"
							side={isMobile ? 'bottom' : 'right'}
							sideOffset={4}
						>
							<DropdownMenuLabel className="text-muted-foreground text-xs">
								Teams
							</DropdownMenuLabel>
							{teams.map((team, index) => (
								<DropdownMenuItem
									key={team.name}
									onClick={() => {
										setActiveTeam(team);
									}}
									className="gap-2 p-2"
								>
									<div className="flex size-6 items-center justify-center rounded-md border">
										<team.logo className="size-3.5 shrink-0" />
									</div>
									{team.name}
									<DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
								</DropdownMenuItem>
							))}
							{/*<DropdownMenuSeparator />
							<DropdownMenuItem>
								<div className="flex items-center space-x-2 cursor-pointer">
									<div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
										<Plus className="size-4" />
									</div>
									<div className="text-muted-foreground font-medium">
										Add organization
									</div>
								</div>
							</DropdownMenuItem>*/}
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	},
);
