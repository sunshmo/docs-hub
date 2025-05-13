import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import ThemeToggle from '@/components/theme-toggle';
import { ReactNode } from 'react';
import I18nToggle from '@/components/i18n/i18n-toggle';

export function Header({
	children,
}: {
	children?: ReactNode;
}) {
	return (
		<header className="sticky top-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
			<div className="flex justify-between w-full">
				<div className="flex items-center gap-2 px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator orientation="vertical" className="mr-2 h-4" />
					{children}
				</div>
				<div className="flex items-center gap-2 px-4">
					<ThemeToggle />
					<I18nToggle />
				</div>
			</div>
		</header>
	);
}
