export default function (
	input: string | URL | globalThis.Request,
	init?: RequestInit,
) {
	return fetch(process.env.API_BASE_URL! + input, init);
}
