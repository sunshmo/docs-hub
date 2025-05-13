export function getServiceAuth() {
	const serviceSecret = process.env.SERVICE_SECRET;
	if (!serviceSecret) {
		throw new Error('SERVICE_SECRET is not configured');
	}

	return serviceSecret;
}

export function getServiceHeader(token: string) {
	return {
		authorization: `Bearer ${token}`,
		'X-Service-Auth': getServiceAuth(),
	};
}
