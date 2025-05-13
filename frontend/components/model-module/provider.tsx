import {
	ActionType,
	ModelProvider,
	ResponseStruct,
} from 'docs-hub-shared-models';
import React, { ReactElement, useEffect, useState } from 'react';
import { Edit, Eye, EyeOff, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import request from '@/request';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface IFormValues {
	name: string;
	apiKey?: string;
	domain?: string;
}

export function Provider({
	data,
	actionType,
	onFailed,
	onSuccess,
	onError,
	onFinally,
}: {
	data?: ModelProvider;
	actionType: ActionType;
	onSuccess?: (res: ModelProvider) => void;
	onFailed?: (res: ResponseStruct) => void;
	onError?: (err: Error) => void;
	onFinally?: () => void;
}) {
	const { t: tModel } = useTranslation('model');
	const { t: tError } = useTranslation('error');
	const { t: tAction } = useTranslation('action');
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState('');
	const [btnContent, setBtnContent] = useState<ReactElement>();
	const [isPwd, setIsPwd] = useState(true);

	const form = useForm({
		defaultValues: {
			name: '',
			apiKey: '',
			domain: '',
		},
	});

	function onSubmit(values: IFormValues) {
		const { name, apiKey, domain } = values;

		if (!name.trim()) {
			toast.error(tModel('providerNameRequired'));
			return;
		}
		if (!domain && !apiKey) {
			toast.error(tModel('domainOrApiKeyRequired'));
			return;
		}

		switch (actionType) {
			case ActionType.Add:
				request('/api/model/provider', {
					method: 'post',
					body: JSON.stringify({
						domain,
						apiKey,
						name: name.trim(),
					}),
				})
					.then((res) => res.json())
					.then((res) => {
						if (res?.success) {
							form.reset();
							setOpen(false);
							onSuccess?.(res?.data);
						} else {
							onFailed?.(res);
						}
					})
					.catch((err) => {
						onError?.(err);
					})
					.finally(() => {
						onFinally?.();
					});
				break;
			case ActionType.Edit:
				if (!data?.id) {
					toast.error(tError('dataError'));
					return;
				}
				request('/api/model/provider', {
					method: 'put',
					body: JSON.stringify({
						id: data.id,
						domain,
						apiKey,
						name: name.trim(),
					}),
				})
					.then((res) => res.json())
					.then((res) => {
						if (res?.success) {
							form.reset();
							setOpen(false);
							onSuccess?.(res?.data);
						} else {
							onFailed?.(res);
						}
					})
					.catch((err) => {
						onError?.(err);
					})
					.finally(() => {
						onFinally?.();
					});
				break;
			case ActionType.View:
				break;
		}
	}

	function setDialogTitle(tp: string) {
		switch (tp) {
			case ActionType.Add:
				setTitle(tModel('addProvider'));
				setBtnContent(<Plus />);
				break;
			case ActionType.Edit:
				setTitle(tModel('editProvider'));
				setBtnContent(<Edit />);
				break;
			case ActionType.View:
				setTitle(tModel('providerDetail'));
				setBtnContent(<Eye />);
				break;
		}
	}
	useEffect(() => {
		setDialogTitle(actionType);
	}, [actionType]);

	function initData() {
		if (data) {
			form.setValue('name', data.name || '');
			form.setValue('apiKey', data.apiKey || '');
			form.setValue('domain', data.domain || '');
		}
	}

	useEffect(() => {
		initData();
	}, [data, form, actionType]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="icon" variant="ghost">
					{btnContent}
				</Button>
			</DialogTrigger>
			<DialogContent className="2xl">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>
						{tModel('providerSaveTip')}
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Label className="flex flex-col">
										<FormLabel className="pb-2">tModel('providerName')</FormLabel>
										<Input
											{...field}
											placeholder={tModel('providerName')}
											className={cn('flex-1 resize-none border rounded-md')}
										/>
									</Label>
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="apiKey"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Label className="flex flex-col">
										<FormLabel className="pb-2">{tModel('apiKey')}</FormLabel>
										<div className="relative">
											<Input
												{...field}
												type={isPwd ? 'password' : 'text'}
												placeholder={tModel('apiKey')}
												className={cn(
													'flex-1 resize-none border rounded-md pr-10',
												)}
											/>

											<Button
												size="icon"
												variant="ghost"
												className="absolute top-0 right-0 h-full"
												onClick={() => setIsPwd(!isPwd)}
												type="button"
											>
												{isPwd ? (
													<Eye className="size-4" />
												) : (
													<EyeOff className="size-4" />
												)}
												<span className="sr-only">
													{isPwd ? 'Show' : 'Hide'} tModel('apiKey')
												</span>
											</Button>
										</div>
									</Label>
								</FormControl>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="domain"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Label className="flex flex-col">
										<FormLabel className="pb-2">{tModel('domain')}</FormLabel>
										<Input
											{...field}
											placeholder={tModel('domain')}
											className={cn('flex-1 resize-none border rounded-md')}
										/>
									</Label>
								</FormControl>
							</FormItem>
						)}
					/>
				</Form>

				<DialogFooter>
					{[ActionType.Add, ActionType.Edit].includes(actionType) && (
						<Button type="submit" onClick={form.handleSubmit(onSubmit)}>
							{tAction('saveChanges')}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
