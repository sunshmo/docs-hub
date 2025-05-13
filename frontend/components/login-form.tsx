'use client';

import React, { memo, useState } from 'react';
import { useForm } from 'react-hook-form';
import JSEncrypt from 'jsencrypt';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import request from '@/request';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserStore } from '@/store/user';
import { useTranslation } from 'react-i18next';

interface ILoginFormValue {
	username: string;
	password: string;
}

interface IRegFormValue {
	username: string;
	password: string;
	confirmPassword: string;
}

export const LoginForm = memo(
	({ className, ...props }: React.ComponentProps<'div'>) => {
		const { t: tLogin } = useTranslation('login');

		const updateUser = useUserStore((state) => state.updateUser);
		const router = useRouter();
		const [tab, setTab] = useState('Login');
		const [loginPwdVisible, setLoginPwdVisible] = useState(true);
		const [regPwdVisible, setRegPwdVisible] = useState(true);
		const [regConfirmPwdVisible, setRegConfirmPwdVisible] = useState(true);

		// 1. Define your regForm.
		const regForm = useForm<IRegFormValue>({
			defaultValues: {
				username: '',
				password: '',
				confirmPassword: '',
			},
		});
		const loginForm = useForm<ILoginFormValue>({
			defaultValues: {
				username: '',
				password: '',
			},
		});

		// 2. Define a submit handler.
		async function onRegSubmit(values: IRegFormValue) {
			const { username, password, confirmPassword } = values;

			if (!username?.trim()) {
				toast.error(tLogin('usernameRequired'));
				return;
			}

			if (!password?.trim()) {
				toast.error(tLogin('passwordRequired'));
				return;
			}

			if (!confirmPassword?.trim()) {
				toast.error(tLogin('passwordConfirmRequired'));
				return;
			}

			if (password.trim() !== confirmPassword.trim()) {
				toast.error(tLogin('passwordDifferent'));
				return;
			}

			try {
				// 1. 获取公钥
				const res = await request('/api/auth/public-key');
				const { data: publicKey } = await res.json();

				// 2. 使用公钥加密密码
				const encrypt = new JSEncrypt();
				encrypt.setPublicKey(publicKey);
				const encryptedPassword = encrypt.encrypt(password.trim());

				if (!encryptedPassword) {
					throw new Error(tLogin('encryptionFailed'));
				}

				request('/api/auth/register', {
					method: 'post',
					body: JSON.stringify({
						username: username.trim(),
						password: encryptedPassword,
					}),
				})
					.then((res) => res.json())
					.then((res) => {
						if (!res?.success) {
							toast.error(res.message || tLogin('registrationFailed'));
						} else {
							toast.success(res.message || tLogin('registrationSuccess'));
							regForm.reset();
						}
					})
					.finally(() => {
						// window.location.href = window.location.origin + '/docs';
					});
			} catch (err) {
				console.error(err);
			}
		}
		async function onLoginSubmit(values: ILoginFormValue) {
			const { username, password } = values;

			if (!username?.trim()) {
				toast.error(tLogin('usernameRequired'));
				return;
			}

			if (!password?.trim()) {
				toast.error(tLogin('passwordRequired'));
				return;
			}

			try {
				// 1. 获取公钥
				const res = await request('/api/auth/public-key');
				const { data: publicKey } = await res.json();

				// 2. 使用公钥加密密码
				const encrypt = new JSEncrypt();
				encrypt.setPublicKey(publicKey);
				const encryptedPassword = encrypt.encrypt(password.trim());

				if (!encryptedPassword) {
					throw new Error(tLogin('encryptionFailed'));
				}

				request('/api/auth/login', {
					method: 'post',
					body: JSON.stringify({
						username: username.trim(),
						password: encryptedPassword,
					}),
				})
					.then((res) => res.json())
					.then((res) => {
						if (!res?.success) {
							toast.error(res.message || tLogin('loginFailed'));
						} else {
							updateUser(res.data);
							const { accessToken } = res.data;
							localStorage.setItem('token', accessToken); // 存储到 localStorage
							loginForm.reset();
							router.replace('/');
						}
					});
			} catch (err) {
				console.error(err);
			}
		}

		return (
			<div className={cn('flex flex-col gap-6', className)} {...props}>
				<Tabs
					value={tab}
					onValueChange={setTab}
					defaultValue="Login"
					className="w-full"
				>
					<TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
						<TabsTrigger value="Login">{tLogin('login')}</TabsTrigger>
						<TabsTrigger value="Registration">{tLogin('registration')}</TabsTrigger>
					</TabsList>

					<TabsContent value="Login">
						<Card>
							<CardHeader className="text-center">
								<CardTitle className="text-xl">{tLogin('title')}</CardTitle>
								<CardDescription>{tLogin('description')}</CardDescription>
							</CardHeader>
							<CardContent>
								<Form {...loginForm}>
									<form
										onSubmit={loginForm.handleSubmit(onLoginSubmit)}
										className="space-y-8"
									>
										<FormField
											control={loginForm.control}
											name="username"
											render={({ field }) => (
												<FormItem>
													<FormLabel>{tLogin('username')}</FormLabel>
													<FormControl>
														<Input
															placeholder={tLogin('usernamePlaceholder')}
															{...field}
														/>
													</FormControl>
													<FormDescription>
														{tLogin('usernameTip')}
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={loginForm.control}
											name="password"
											render={({ field }) => (
												<FormItem>
													<FormLabel>{tLogin('password')}</FormLabel>
													<div className="relative">
														<FormControl>
															<Input
																{...field}
																type={loginPwdVisible ? 'password' : 'text'}
																placeholder={tLogin('password')}
																className={cn(
																	'flex-1 resize-none border rounded-md',
																)}
															/>
														</FormControl>

														<Button
															size="icon"
															variant="ghost"
															className="absolute top-0 right-0 h-full"
															onClick={() =>
																setLoginPwdVisible(!loginPwdVisible)
															}
															type="button"
														>
															{loginPwdVisible ? (
																<Eye className="size-4" />
															) : (
																<EyeOff className="size-4" />
															)}
															<span className="sr-only">
																{loginPwdVisible ? 'Show' : 'Hide'} {tLogin('password')}
															</span>
														</Button>
													</div>
												</FormItem>
											)}
										/>
										<Button type="submit" className="w-full">
											{tLogin('submit')}
										</Button>
									</form>
								</Form>
								<div className="text-center text-sm">
									{tLogin('noAccountTip')}{' '}
									<span
										className="underline underline-offset-4 cursor-pointer"
										onClick={() => {
											loginForm.reset();
											setTab('Registration');
										}}
									>
										{tLogin('signUp')}
									</span>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
					<TabsContent value="Registration">
						<Card>
							<CardHeader className="text-center">
								<CardTitle className="text-xl">{tLogin('createAccount')}</CardTitle>
								<CardDescription>
									{tLogin('registrationTip')}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Form {...regForm}>
									<form
										onSubmit={regForm.handleSubmit(onRegSubmit)}
										className="space-y-8"
									>
										<FormField
											control={regForm.control}
											name="username"
											render={({ field }) => (
												<FormItem>
													<FormLabel>{tLogin('username')}</FormLabel>
													<FormControl>
														<Input
															placeholder={tLogin('usernamePlaceholder')}
															{...field}
														/>
													</FormControl>
													<FormDescription>
														{tLogin('usernameTip')}
													</FormDescription>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={regForm.control}
											name="password"
											render={({ field }) => (
												<FormItem>
													<FormLabel>{tLogin('password')}</FormLabel>
													<div className="relative">
														<FormControl>
															<Input
																{...field}
																type={regPwdVisible ? 'password' : 'text'}
																placeholder={tLogin('password')}
																className={cn(
																	'flex-1 resize-none border rounded-md',
																)}
															/>
														</FormControl>

														<Button
															size="icon"
															variant="ghost"
															className="absolute top-0 right-0 h-full"
															onClick={() => setRegPwdVisible(!regPwdVisible)}
															type="button"
														>
															{regPwdVisible ? (
																<Eye className="size-4" />
															) : (
																<EyeOff className="size-4" />
															)}
															<span className="sr-only">
																{regPwdVisible ? 'Show' : 'Hide'} {tLogin('password')}
															</span>
														</Button>
													</div>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={regForm.control}
											name="confirmPassword"
											render={({ field }) => (
												<FormItem>
													<FormLabel>{tLogin('passwordConfirm')}</FormLabel>
													<div className="relative">
														<FormControl>
															<Input
																{...field}
																type={
																	regConfirmPwdVisible ? 'password' : 'text'
																}
																placeholder={tLogin('passwordConfirm')}
																className={cn(
																	'flex-1 resize-none border rounded-md',
																)}
															/>
														</FormControl>

														<Button
															size="icon"
															variant="ghost"
															className="absolute top-0 right-0 h-full"
															onClick={() =>
																setRegConfirmPwdVisible(!regConfirmPwdVisible)
															}
															type="button"
														>
															{regConfirmPwdVisible ? (
																<Eye className="size-4" />
															) : (
																<EyeOff className="size-4" />
															)}
															<span className="sr-only">
																{regConfirmPwdVisible ? 'Show' : 'Hide'}{' '}
																{tLogin('passwordConfirm')}
															</span>
														</Button>
													</div>
												</FormItem>
											)}
										/>
										<Button type="submit" className="w-full">
											{tLogin('submit')}
										</Button>
									</form>
								</Form>
								<div className="text-center text-sm">
									{tLogin('haveAccount')}{' '}
									<span
										className="underline underline-offset-4 cursor-pointer"
										onClick={() => {
											regForm.reset();
											setTab('Login');
										}}
									>
										{tLogin('signIn')}
									</span>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
				<div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
					{tLogin('privacy')}
				</div>
			</div>
		);
	},
);
