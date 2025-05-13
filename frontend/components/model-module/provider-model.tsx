import {
	ActionType,
	Model,
	ModelProvider,
	ResponseStruct,
} from 'docs-hub-shared-models';
import React, { ReactElement, useEffect, useState } from 'react';
import { Edit, Eye, Plus } from 'lucide-react';
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

interface IFormValues {
	providerId: string;
	name: string;
}

export function ProviderModel({
	data,
	provider,
	actionType,
	onSuccess,
	onFailed,
	onError,
	onFinally,
}: {
	data?: Model;
	provider: ModelProvider;
	name?: string;
	actionType: ActionType;
	onSuccess?: (res: ModelProvider) => void;
	onFailed?: (res: ResponseStruct) => void;
	onError?: (err: Error) => void;
	onFinally?: () => void;
}) {
	const { t: tModel } = useTranslation('model');
	const { t: tAction } = useTranslation('action');
	const { t: tError } = useTranslation('error');
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState('');
	const [btnContent, setBtnContent] = useState<ReactElement>();

	const form = useForm({
		defaultValues: {
			name: '',
			providerId: '',
		},
	});

	function onSubmit(values: IFormValues) {
		const { name } = values;

		if (!provider.id) {
			toast.error(tModel('providerNameRequired'));
			return;
		}
		if (!name) {
			toast.error(tModel('modelNameRequired'));
			return;
		}

		switch (actionType) {
			case ActionType.Add:
				request('/api/model', {
					method: 'post',
					body: JSON.stringify({
						providerId: provider.id,
						name,
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
				request('/api/model', {
					method: 'put',
					body: JSON.stringify({
						providerId: provider.id,
						id: data.id,
						name,
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
				setTitle(tModel('addModel'));
				setBtnContent(<Plus />);
				break;
			case ActionType.Edit:
				setTitle(tModel('editModel'));
				setBtnContent(<Edit />);
				break;
			case ActionType.View:
				setTitle(tModel('modelDetail'));
				setBtnContent(<Eye />);
				break;
		}
	}

	useEffect(() => {
		setDialogTitle(actionType);
	}, [actionType]);

	function initData() {
		if (data) {
			form.setValue('providerId', provider.id || '');
			form.setValue('name', data.name || '');
		}
	}

	useEffect(() => {
		initData();
	}, [data, form, actionType]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button disabled={!provider?.id} size="icon" variant="ghost">
					{btnContent}
				</Button>
			</DialogTrigger>
			<DialogContent className="2xl">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>
						{tModel('providerModelTip')}
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<FormField
						control={form.control}
						name="providerId"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="pb-2">{tModel('providerName')}</FormLabel>
								<Select value={provider.id}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder={tModel('providerName')} />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value={provider.id}>{provider.name}</SelectItem>
									</SelectContent>
								</Select>
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="pb-2">{tModel('modeName')}</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder={tModel('modeName')}
										className={cn('flex-1 resize-none border rounded-md')}
									/>
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
