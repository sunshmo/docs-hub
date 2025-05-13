import type { Metadata } from 'next';
import './globals.css';
import React from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { I18nProvider } from '@/components/i18n/i18n-provider';
import { Auth } from '@/components/auth';

export const metadata: Metadata = {
	title: 'Doc Hub App',
	description: '',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="antialiased" suppressHydrationWarning>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<Auth>
						<I18nProvider>{children}</I18nProvider>
					</Auth>
				</ThemeProvider>

				<Toaster />
			</body>
		</html>
	);
}
