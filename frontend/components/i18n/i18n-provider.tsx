'use client';

import { I18nextProvider } from 'react-i18next';
import { ReactNode, useEffect, useState } from 'react';
import i18n from '@/i18n';

export function I18nProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// @ts-expect-error
		i18n.loadLanguages(i18n.options.fallbackLng).then(() => setLoading(false));
	}, []);

	if (loading) {
		return <div className="h-svh py-20 bg-gray-950 text-cyan-100" />;
	}

	return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
