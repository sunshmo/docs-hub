'use client';

import { SectionCards } from '@/components/section-cards';
import VListTable from '@/components/table/list-table';

export default function DashboardPage() {
	return (
		<div className="flex flex-col gap-4 pl-4 pr-4 w-full">
			<div className="text-2xl pt-2 border-b">Dashboard</div>
			<SectionCards></SectionCards>
			<VListTable></VListTable>
			<div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
			<div className="grid auto-rows-min gap-4 md:grid-cols-3">
				<div className="aspect-video rounded-xl bg-muted/50" />
				<div className="aspect-video rounded-xl bg-muted/50" />
				<div className="aspect-video rounded-xl bg-muted/50" />
			</div>
		</div>
	);
}
