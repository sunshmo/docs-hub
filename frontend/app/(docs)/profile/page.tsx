'use client';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from '@/components/ui/form';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import request from '@/request';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { useUserStore } from '@/store/user';
import { useTranslation } from 'react-i18next';

interface IProfileFormValues {
	username: string;
	email: string;
	telephone: string;
}

interface IPasswordFormValues {
	confirmPassword: string;
	newPassword: string;
}

export default function ProfilePage() {
	const { t: tProfile } = useTranslation('profile');
	const { t: tAction } = useTranslation('action');
	const user = useUserStore((state) => state.user);

	const [isProfileEditing, setIsProfileEditing] = useState(false);

	// Password change state
	const [isChangingPassword, setIsChangingPassword] = useState(false);
	const [isChcPwd, setIsChcPwd] = useState(true);
	const [isChnPwd, setIsChnPwd] = useState(true);
	const [passwordError, setPasswordError] = useState('');

	const profileForm = useForm<IProfileFormValues>({
		defaultValues: {
			username: user?.username ?? '',
			email: user?.email ?? '',
			telephone: user?.telephone ?? '',
		},
	});

	const passwordForm = useForm<IPasswordFormValues>({
		defaultValues: {
			confirmPassword: '',
			newPassword: '',
		},
	});

	function onProfileSubmit(values: IProfileFormValues) {
		if (!user?.id) {
			toast.error('invalid user');
			return;
		}
		request('/api/user', {
			method: 'put',
			body: JSON.stringify({ ...values, id: user.id }),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res?.success) {
					setIsProfileEditing(false);
					toast.success('Edit profile success');
				} else {
					toast.error('Edit profile failed');
				}
			});
	}

	const handlePasswordSubmit = (values: IPasswordFormValues) => {
		const { newPassword, confirmPassword } = values;
		if (!newPassword.trim()) {
			setPasswordError(tProfile('passwordEmpty'));
			return;
		}
		if (!confirmPassword.trim()) {
			setPasswordError(tProfile('passwordConfirmEmpty'));
			return;
		}
		// Validate passwords
		if (newPassword !== confirmPassword) {
			setPasswordError(tProfile('passwordNotMatch'));
			return;
		}
		if (newPassword.length < 8) {
			setPasswordError(tProfile('passwordLimitMsg'));
			return;
		}

		if (!user?.id) {
			toast.error(tProfile('userNotFound'));
			return;
		}

		request('/api/user', {
			method: 'put',
			body: JSON.stringify({
				id: user.id,
				password: newPassword.trim(),
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res?.data) {
					toast.success(tProfile('passwordUpdatedSuccess'));
					setPasswordError('');
					setIsChangingPassword(false);
					window.location.reload();
				} else {
					toast.error(tProfile('passwordUpdatedFailed'));
				}
			});
	};

	return (
		<div className="container mx-auto p-4 space-y-6">
			<Tabs defaultValue="profile" className="w-full">
				<TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
					<TabsTrigger value="profile">{tProfile('tabProfile')}</TabsTrigger>
					<TabsTrigger value="settings">{tProfile('tabSettings')}</TabsTrigger>
				</TabsList>

				<TabsContent value="profile">
					<Card>
						<CardHeader>
							<CardTitle>{tProfile('profileTitle')}</CardTitle>
							<CardDescription>{tProfile('description')}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<Form {...profileForm}>
								<FormField
									control={profileForm.control}
									name="username"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{tProfile('username')}</FormLabel>
											<FormControl>
												<Input
													{...field}
													readOnly={!isProfileEditing}
													placeholder={tProfile('username')}
													className={cn(
														'flex-1 resize-none border rounded-md',
														!isProfileEditing
															? 'opacity-70 cursor-not-allowed'
															: '',
													)}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={profileForm.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{tProfile('email')}</FormLabel>
											<FormControl>
												<Input
													{...field}
													readOnly={!isProfileEditing}
													placeholder={tProfile('email')}
													className={cn(
														'flex-1 resize-none border rounded-md',
														!isProfileEditing
															? 'opacity-70 cursor-not-allowed'
															: '',
													)}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={profileForm.control}
									name="telephone"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{tProfile('telephone')}</FormLabel>
											<FormControl>
												<Input
													{...field}
													readOnly={!isProfileEditing}
													placeholder={tProfile('telephone')}
													className={cn(
														'flex-1 resize-none border rounded-md',
														!isProfileEditing
															? 'opacity-70 cursor-not-allowed'
															: '',
													)}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</Form>
						</CardContent>
						<CardFooter className="flex justify-between">
							{isProfileEditing ? (
								<>
									<Button
										variant="outline"
										onClick={() => setIsProfileEditing(false)}
									>
										{tAction('cancel')}
									</Button>
									<Button onClick={profileForm.handleSubmit(onProfileSubmit)}>
										{tAction('saveChanges')}
									</Button>
								</>
							) : (
								<Button
									onClick={() => setIsProfileEditing(true)}
									className="ml-auto"
								>
									{tAction('edit')}
								</Button>
							)}
						</CardFooter>
					</Card>
				</TabsContent>

				<TabsContent value="settings">
					<Card>
						<CardHeader>
							<CardTitle>{tProfile('passwordTitle')}</CardTitle>
							<CardDescription>{tProfile('changePasswordTip')}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<Form {...passwordForm}>
								<FormField
									control={passwordForm.control}
									name="newPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{tProfile('passwordTitle')}</FormLabel>
											<div className="relative">
												<FormControl>
													<Input
														{...field}
														type={isChnPwd ? 'password' : 'text'}
														readOnly={!isChangingPassword}
														placeholder={tProfile('passwordTitle')}
														className={cn(
															'flex-1 resize-none border rounded-md',
															!isChangingPassword
																? 'opacity-70 cursor-not-allowed'
																: '',
														)}
													/>
												</FormControl>

												<Button
													size="icon"
													variant="ghost"
													className="absolute top-0 right-0 h-full"
													onClick={() => setIsChnPwd(!isChnPwd)}
													type="button"
												>
													{isChnPwd ? (
														<Eye className="size-4" />
													) : (
														<EyeOff className="size-4" />
													)}
													<span className="sr-only">
														{isChnPwd ? 'Show' : 'Hide'} {tProfile('passwordTitle')}
													</span>
												</Button>
											</div>
										</FormItem>
									)}
								/>

								<FormField
									control={passwordForm.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{tProfile('confirmPassword')}</FormLabel>
											<div className="relative">
												<FormControl>
													<Input
														{...field}
														type={isChcPwd ? 'password' : 'text'}
														placeholder={tProfile('confirmPassword')}
														className={cn(
															'flex-1 resize-none border rounded-md',
															!isChangingPassword
																? 'opacity-70 cursor-not-allowed'
																: '',
														)}
													/>
												</FormControl>

												<Button
													size="icon"
													variant="ghost"
													className="absolute top-0 right-0 h-full"
													onClick={() => setIsChcPwd(!isChcPwd)}
													type="button"
												>
													{isChcPwd ? (
														<Eye className="size-4" />
													) : (
														<EyeOff className="size-4" />
													)}
													<span className="sr-only">
														{isChcPwd ? 'Show' : 'Hide'} {tProfile('confirmPassword')}
													</span>
												</Button>
											</div>
										</FormItem>
									)}
								/>
							</Form>
							{passwordError && (
								<p className="text-sm text-red-500">{passwordError}</p>
							)}
						</CardContent>
						<CardFooter className="flex justify-between">
							{isChangingPassword ? (
								<>
									<Button
										variant="outline"
										onClick={() => setIsChangingPassword(false)}
									>
										{tAction('cancel')}
									</Button>
									<Button
										onClick={passwordForm.handleSubmit(handlePasswordSubmit)}
									>
										{tAction('save')}
									</Button>
								</>
							) : (
								<Button
									onClick={() => setIsChangingPassword(true)}
									className="ml-auto"
								>
									{tProfile('changePassword')}
								</Button>
							)}
						</CardFooter>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
