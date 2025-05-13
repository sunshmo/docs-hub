// 'use client';

import { ChevronRight, type LucideIcon } from 'lucide-react';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

export function NavMain({
	dataSource,
}: {
	dataSource: {
		title: string;
		url?: string;
		icon?: LucideIcon;
		isActive?: boolean;
		children?: {
			title: string;
			url?: string;
			icon?: LucideIcon;
			isActive?: boolean;
			children?: any[];
		}[];
	}[];
}) {
	const pathname = usePathname();

	const renderMenuItems = (items: typeof dataSource) => {
		if (!Array.isArray(items)) return null;
		return items.map((item) => {
			return (
				<Collapsible
					key={item.title}
					asChild
					defaultOpen={item.isActive}
					className="group/collapsible"
				>
					<SidebarMenuItem>
						{Array.isArray(item.children) && item.children.length > 0 ? (
							<>
								<CollapsibleTrigger asChild>
									<SidebarMenuButton tooltip={item.title}>
										{item.icon && <item.icon />}
										<span>{item.title}</span>
										<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
									</SidebarMenuButton>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<SidebarMenuSub>
										{renderMenuItems(item.children)}
									</SidebarMenuSub>
								</CollapsibleContent>
							</>
						) : (
							<SidebarMenuButton
								asChild
								isActive={item.url?.startsWith(pathname)}
							>
								<a href={item.url}>
									{item.icon && <item.icon />}
									<span>{item.title}</span>
								</a>
							</SidebarMenuButton>
						)}
					</SidebarMenuItem>
				</Collapsible>
			);
		});
	};

	return (
		<SidebarGroup>
			<SidebarMenu>{renderMenuItems(dataSource)}</SidebarMenu>
		</SidebarGroup>
	);
}
