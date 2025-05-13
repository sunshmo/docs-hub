'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const supportLanguage: Record<string, string> = {
	"zh-CN": "中文",
	"en": "English"
};

export default function I18nToggle() {
	const { i18n } = useTranslation();
	const [mounted, setMounted] = useState(false);

	const currentLanguage = i18n.language;

	const changeLanguage = (lng: string) => {
		i18n.changeLanguage(lng).then().catch();
	};

	// 防止 hydration 问题
	useEffect(() => setMounted(true), []);

	if (!mounted) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className="pl-2 pr-2 pt-1 pb-1 bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-md">
					{supportLanguage[currentLanguage]}
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				{Object.keys(supportLanguage).map(lng => {
					return (
						<DropdownMenuItem key={lng} onClick={() => changeLanguage(lng)}>
							{lng}
							<DropdownMenuShortcut>{supportLanguage[lng]}</DropdownMenuShortcut>
						</DropdownMenuItem>
					)
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
