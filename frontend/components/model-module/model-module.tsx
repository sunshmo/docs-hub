'use client';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import request from '@/request';
import { ActionType, Model, ModelProvider } from 'docs-hub-shared-models';
import { useForm } from 'react-hook-form';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Provider } from '@/components/model-module/provider';
import JsonEditor from '@/components/model-module/json-editor';
import { ProviderModel } from '@/components/model-module/provider-model';
import { toast } from 'sonner';
import { DeleteDialog } from '@/components/delete-dialog';
import { Minus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface IFormValues {
	providerId: string;
	modelId: string;
}

export const ModelModule = memo(() => {
	const { t: tModel} = useTranslation('model');
	const { t: tAction} = useTranslation('action');
	const [providers, setProviders] = useState<ModelProvider[]>([]);
	const [models, setModels] = useState<Model[]>([]);
	const [modelConfig, setModelConfig] = useState<string>('{}');
	const [deleteProviderVisible, setDeleteProviderVisible] = useState(false);
	const [deleteModelVisible, setDeleteModelVisible] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<IFormValues>({
		defaultValues: {
			providerId: '',
			modelId: '',
		},
	});

	const providerId = form.watch('providerId');
	const modelId = form.watch('modelId');

	const selectedProvider = useMemo(
		() => providers.find((p) => p.id === providerId),
		[providers, providerId],
	);

	const selectedModel = useMemo(
		() => models.find((m) => m.id === modelId),
		[models, modelId],
	);

	const fetchModelProviders = useCallback(async () => {
		try {
			const response = await request('/api/model/provider/id', {
				method: 'post',
				body: JSON.stringify({}),
			});
			const data = await response.json();
			setProviders(Array.isArray(data.data) ? data.data : []);
		} catch (error) {
			toast.error(tModel('providerFetchFailed'));
			console.error(error);
		}
	}, []);

	const fetchModels = useCallback(async (providerId: string) => {
		if (!providerId) return;
		try {
			const response = await request('/api/model/id', {
				method: 'post',
				body: JSON.stringify({ providerId }),
			});
			const data = await response.json();
			setModels(Array.isArray(data.data) ? data.data : []);
		} catch (error) {
			toast.error(tModel('modelFetchFailed'));
			console.error(error);
		}
	}, []);

	const onSubmit = useCallback(
		async (values: IFormValues) => {
			const { providerId, modelId } = values;
			if (!providerId) {
				toast.error(tModel('providerPlaceholder'))
				return;
			}
			if (!modelId) {
				toast.error(tModel('modelPlaceholder'))
				return;
			}

			setIsSubmitting(true);

			try {
				const response = await request('/api/model', {
					method: 'put',
					body: JSON.stringify({
						providerId,
						id: modelId,
						config: modelConfig,
					}),
				});
				const result = await response.json();

				if (response.ok) {
					toast.success(tAction('savedSuccess'));
					fetchModels(providerId);
				} else {
					throw new Error(result.message || tAction('savedFailed'));
				}
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : tAction('savedFailed'),
				);
			} finally {
				setIsSubmitting(false);
			}
		},
		[modelConfig, fetchModels],
	);

	useEffect(() => {
		fetchModelProviders();
	}, [fetchModelProviders]);

	useEffect(() => {
		if (providerId) {
			fetchModels(providerId);
		}
	}, [providerId, fetchModels]);

	return (
		<div className="space-y-4 p-4">
			<div className="text-gray-700">
				{tModel('parameterTip')}
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="providerId"
						render={({ field }) => (
							<FormItem>
								<div className="flex items-center justify-between">
									<FormLabel>{tModel('providerName')}</FormLabel>
									<div className="flex">
										<Provider
											actionType={ActionType.Add}
											onSuccess={() => {
												toast.success(tAction('addedSuccess'));
												fetchModelProviders();
											}}
										/>
										{selectedProvider && (
											<>
												<Provider
													data={selectedProvider}
													actionType={ActionType.Edit}
													onSuccess={(res) => {
														toast.success(tAction('updatedSuccess'));
														fetchModelProviders();
														if (res?.id) {
															form.setValue('providerId', res.id);
														}
													}}
												/>
												<Button
													size="icon"
													variant="ghost"
													onClick={() => setDeleteProviderVisible(true)}
												>
													<Minus className="h-4 w-4" />
												</Button>
											</>
										)}
									</div>
								</div>
								<Select
									value={field.value}
									onValueChange={(value) => {
										field.onChange(value);
										form.setValue('modelId', '');
									}}
									disabled={isSubmitting}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder={tModel('providerPlaceholder')} />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{providers.map(({ name, id }) => (
											<SelectItem key={id} value={id}>
												{name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormDescription>
									{tModel('providerTip')}
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="modelId"
						render={({ field }) => (
							<FormItem>
								<div className="flex items-center justify-between">
									<FormLabel>{tModel('modelName')}</FormLabel>
									<div className="flex">
										{selectedProvider && (
											<>
												<ProviderModel
													provider={selectedProvider}
													actionType={ActionType.Add}
													onSuccess={() => {
														toast.success(tAction('addedSuccess'));
														fetchModels(providerId);
													}}
												/>
												{selectedModel && (
													<>
														<ProviderModel
															data={selectedModel}
															provider={selectedProvider}
															actionType={ActionType.Edit}
															onSuccess={() => {
																toast.success(tAction('updatedSuccess'));
																fetchModels(providerId);
															}}
														/>
														<Button
															size="icon"
															variant="ghost"
															onClick={() => setDeleteModelVisible(true)}
															disabled={!modelId}
														>
															<Minus className="h-4 w-4" />
														</Button>
													</>
												)}
											</>
										)}
									</div>
								</div>
								<Select
									value={field.value}
									onValueChange={field.onChange}
									disabled={!providerId || isSubmitting}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder={tModel('modelPlaceholder')} />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{models.map(({ name, id }) => (
											<SelectItem key={id} value={id}>
												{name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div>
						<div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							{tModel('config')}
						</div>

						{modelId ? (
							<JsonEditor
								value={selectedModel?.config}
								onChange={(json) => setModelConfig(JSON.stringify(json))}
								className="mt-2 shadow"
							/>
						) : (
							<div className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-gray-500 dark:text-gray-400">
								{tModel('modelEmptyTip')}
							</div>
						)}

						<div className="mt-2 text-sm text-muted-foreground">
							{tModel('tip')}
						</div>
					</div>
				</form>

				<Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
					{isSubmitting ? tAction('saving') : tAction('save')}
				</Button>
				<Button
					variant="secondary"
					className="ml-2"
					onClick={() => form.reset()}
				>
					{tAction('reset')}
				</Button>
			</Form>

			{/* 保持原有的 DeleteDialog 逻辑不变 */}
			<DeleteDialog
				input="/api/model/provider"
				body={JSON.stringify({
					ids: [providerId],
				})}
				open={deleteProviderVisible}
				onOpenChange={() => setDeleteProviderVisible(false)}
				onSuccess={() => {
					toast.success(tAction('deleteFailed'));
					fetchModelProviders();
					form.reset();
				}}
			/>

			<DeleteDialog
				input="/api/model"
				body={JSON.stringify({
					providerId,
					ids: [modelId],
				})}
				open={deleteModelVisible}
				onOpenChange={() => setDeleteModelVisible(false)}
				onSuccess={() => {
					toast.success(tAction('deleteSuccess'));
					form.setValue('modelId', '');
					fetchModels(providerId);
				}}
			/>
		</div>
	);
});

ModelModule.displayName = 'ModelModule';
