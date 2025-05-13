const loadedLangs = new Set<string>();

export const loadPrismLang = async (lang: string) => {
	if (loadedLangs.has(lang)) return;

	try {
		await import(`prismjs/components/prism-${lang}.js`);
		loadedLangs.add(lang);
	} catch (e) {
		console.warn(`Prism: failed to load language "${lang}"`);
	}
};
