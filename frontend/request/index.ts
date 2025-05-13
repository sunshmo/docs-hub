import { TokenStatus } from 'docs-hub-shared-models';
import i18n from '@/i18n';

const baseURL = 'http://localhost:3456';

const loginLabels = [
	'Unauthorized',
	TokenStatus.invalid_token,
	TokenStatus.invalid_refresh_token,
	TokenStatus.no_token,
];

export default async function request(
	input: string | URL | globalThis.Request,
	init?: RequestInit,
) {
	const params = {
		...init,
		headers: {
			...init?.headers,
			Authorization: `Bearer ${localStorage.getItem('token')}`,
		},
		credentials: 'include' as const,
	};

	return fetch(baseURL + input, params)
		.then((response) => {
			if (loginLabels.includes(response.statusText)) {
				throw new Error(i18n.t('login:unauthorized'));
			}
			// status code: 200-299
			if (!response.ok) {
				if (response.status === 401) {
					throw new Error(i18n.t('login:unauthorized'));
				}
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response;
		})
		.catch((err) => {
			redirect2login();
			return err;
		});
}

function redirect2login() {
	const loginUrl = location.origin + '/login';
	// not the same url
	if (!window.location.href.startsWith(loginUrl)) {
		window.location.href = loginUrl;
	}
}
