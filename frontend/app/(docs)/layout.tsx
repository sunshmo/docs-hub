import { ReactNode, Suspense } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SessionProvider } from '@/hooks/use-session';
import { Header } from '@/components/header';
import { SuperSearch } from '@/components/super-search/super-search';

export default function DashboardPage({ children }: { children: ReactNode }) {
	return (
		<Suspense>
			<SessionProvider>
				<SidebarProvider>
					<AppSidebar />
					<SidebarInset className="overflow-hidden">
						<Header>
							<SuperSearch />
						</Header>
						<div className="flex flex-1">{children}</div>
					</SidebarInset>
				</SidebarProvider>
			</SessionProvider>
		</Suspense>
	);
}
