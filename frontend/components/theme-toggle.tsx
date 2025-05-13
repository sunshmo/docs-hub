'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Preventing hydration problems
	useEffect(() => setMounted(true), []);

	if (!mounted) return null;

	return (
		<button
			className="pl-2 pr-2 pt-1 pb-1 hover:bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-md"
			onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
		>
			{theme === 'dark' ? '🌞' : '🌙'}
		</button>
	);
}
