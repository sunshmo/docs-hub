import puppeteer, { Browser } from 'puppeteer';

export async function getVisibleText(url: string): Promise<string> {
	let browser: Browser;
	try {
		// 启动浏览器
		browser = await puppeteer.launch({
			executablePath: process.env.EXECUTABLE_PATH,
		});

		// 打开页面
		const page = await browser.newPage();
		await page.goto(url, { waitUntil: 'networkidle0' }); // 确保 JS 渲染完成

		// 只提取当前视口中可见的文本
		const visibleText = await page.evaluate(() => {
			function isVisible(el: HTMLElement) {
				const style = window.getComputedStyle(el);
				return (
					style &&
					style.display !== 'none' &&
					style.visibility !== 'hidden' &&
					el.offsetHeight > 0
				);
			}

			const walker = document.createTreeWalker(
				document.body,
				NodeFilter.SHOW_TEXT,
				null,
			);
			const texts = [];

			while (walker.nextNode()) {
				const node = walker.currentNode;
				// @ts-expect-error
				if (node && isVisible(node.parentElement)) {
					// @ts-expect-error
					const cleaned = node.textContent.trim();
					if (cleaned) {
						// @ts-expect-error
						texts.push(cleaned);
					}
				}
			}

			return texts;
		});

		// console.log('可见内容:', visibleText);

		// 等待页面加载（可选）
		// await page.waitForSelector('body');

		// 获取页面内容
		// const content = await page.content();

		// 执行页面内脚本
		// const data = await page.evaluate(() => {
		//   return document.querySelector('h1').innerText;
		// });

		// return content;
		return visibleText.join('');
	} catch (error) {
		console.error('Fetch failed:', error);

		return '';
	} finally {
		// @ts-ignore
		if (browser) {
			await browser.close();
		}
	}
}
