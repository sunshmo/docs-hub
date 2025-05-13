'use client';

import { Input } from '@/components/ui/input';
import React, { useCallback, useEffect, useState } from 'react';
import request from '@/request';
import { SearchData, SearchDataEnum } from 'docs-hub-shared-models';
import { ContentRecord } from '@/components/content-record';
import { SearchItem } from '@/components/super-search/search-item';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { Loader, Search, X } from 'lucide-react';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

export function SuperSearch() {
	const { t } = useTranslation('common');
	const router = useRouter();
	const [open, onOpenChange] = useState(false);
	const [list, setList] = useState<SearchData[]>([]);
	const [loading, setLoading] = useState(false);

	const form = useForm({
		defaultValues: {
			keyword: '',
		},
	});
	const keyword = form.watch('keyword');

	const handleSearch = useCallback(() => {
		if (!keyword) {
			setList([]);
			return;
		}
		setLoading(true);
		request('/api/search', {
			method: 'post',
			body: JSON.stringify({
				keyword,
			})
		}).then(res => res.json())
			.then(res => {
				setList(Array.isArray(res.data) ? (res.data as SearchData[]).map(e => {
					return {
						...e,
						updatedAt: dayjs(e.updatedAt).format('YYYY/MM/DD')
					};
				}) : []);
			})
			.finally(() => {
				setLoading(false);
			})
	}, [keyword]);

	useEffect(() => {
		handleSearch();
	}, [keyword]);

	function jump(event: React.MouseEvent<HTMLDivElement, MouseEvent>, data: SearchData) {
		switch (data.type) {
			case SearchDataEnum.session:
				router.push(`/chat?sessionId=${data.id}`);
				break;
			case SearchDataEnum.document:
				router.push(`/document?documentId=${data.id}`)
				break;
		}
		onOpenChange(false);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<button className="pl-2 pr-2 pt-1 pb-1 hover:bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-md">
					<Search />
				</button>
			</DialogTrigger>
			<DialogContent className="2xl">
				<DialogHeader>
					<DialogTitle>{t('superSearch.search')}</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col w-full overflow-hidden p-1">
					<div className="mb-2 relative flex">
						<Form {...form}>
							<FormField
								control={form.control}
								name="keyword"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormControl>
											<Input
												{...field}
												placeholder={t('superSearch.btnSearch')}
												className="pr-10 w-full"
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</Form>
						<button
							className="absolute right-0 top-0.5 pl-2 pr-2 pt-1 pb-1 hover:bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-md"
							onClick={() => form.reset()}
						>
							<X />
						</button>
					</div>
					{keyword ? (
						<div className="h-[300px] overflow-y-auto">
							{loading ? (
								<div className="flex justify-center">
									<Loader />
								</div>
							) : list.length ? list.map((data, index) => {
								return (
									<div key={data.id} onClick={(event) => jump(event, data)}>
										<SearchItem className="w-full h-full cursor-pointer" data={data} />
									</div>
								);
							}) : (
								<div className="text-center">{t('superSearch.empty')}</div>
							)}
						</div>
					) : (
						<ContentRecord className="h-[300px]" jump={jump} />
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
