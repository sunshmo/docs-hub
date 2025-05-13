'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function () {
	const { t: tWelcome } = useTranslation('welcome');

	return (
		<div className="h-svh py-20 bg-gray-950 text-cyan-100">
			<div className="text-center text-5xl">
				{tWelcome('title')}{' '}
				<span className="font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
					Doc Hub
				</span>
			</div>
			<div className="text-center text-3xl p-20">
				{tWelcome('description')}
			</div>

			<div className="flex justify-center">
				<Link href="/chat">
					<button className="a-button">{tWelcome('btnText')}</button>
				</Link>
			</div>
		</div>
	);
}
