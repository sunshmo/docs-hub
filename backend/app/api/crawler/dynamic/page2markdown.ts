import puppeteer, { Page } from 'puppeteer';
import TurndownService from 'turndown';

async function autoScroll(page: Page) {
	await page.evaluate(async () => {
		await new Promise<void>((resolve) => {
			let totalHeight = 0;
			const distance = 100;
			const timer = setInterval(() => {
				const scrollHeight = document.body.scrollHeight;
				window.scrollBy(0, distance);
				totalHeight += distance;
				if (totalHeight >= scrollHeight) {
					clearInterval(timer);
					resolve();
				}
			}, 100);
		});
	});
}

export async function crawlToMarkdown({
	url,
	selector = 'body',
}: {
	url: string;
	selector?: string;
}) {
	const browser = await puppeteer.launch({
		executablePath: process.env.EXECUTABLE_PATH,
		headless: true,
	});
	const page = await browser.newPage();

	try {
		console.log(`🌐 Navigating to ${url}`);
		await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

		// 自动滚动页面，加载懒加载内容
		await autoScroll(page);

		// 将图片和链接转为绝对路径
		await page.evaluate(() => {
			const toAbsolute = (src) =>
				src.startsWith('http') ? src : window.location.origin + src;
			document.querySelectorAll('img').forEach((img) => {
				img.src = toAbsolute(img.getAttribute('src') || '');
			});
			document.querySelectorAll('a').forEach((a) => {
				a.href = toAbsolute(a.getAttribute('href') || '');
			});
		});

		// 抓取内容 HTML
		const html = await page
			.$eval(selector, (el) => el.innerHTML)
			.catch(async () => {
				console.warn(
					`⚠️ Selector ${selector} not found. Using full page content.`,
				);
				return await page.content(); // fallback
			});

		// HTML -> Markdown
		const td = new TurndownService({ headingStyle: 'atx' });
		const md = td.turndown(html);

		return md;
	} catch (err) {
		console.error('❌ Error:', err);
	} finally {
		await browser.close();
	}
}
