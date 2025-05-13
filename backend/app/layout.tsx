export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="antialiased" suppressHydrationWarning>
				{children}
			</body>
		</html>
	);
}
