'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'docs-hub-shared-models';
import request from '@/request';
import { useUserStore } from '@/store/user';

export function useAuth() {
	const router = useRouter();
	const updateUser = useUserStore((state) => state.updateUser);
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	async function fetchUser() {
		try {
			const res = await request('/api/auth/me');
			if (res.ok) {
				const { data } = await res.json();
				setUser(data);
				updateUser(data);
				setLoading(false);
			} else {
				// token 可能过期，尝试 refresh
				const r = await request('/api/auth/refresh');
				if (r.ok) {
					const { data } = await r.json();
					setUser(data);
					updateUser(data);
					setLoading(false);
				} else {
					if (typeof window !== 'undefined') {
						router.replace('/login');
					}
				}
			}
		} catch (e) {
			console.error('Auth error:', e);
			if (typeof window !== 'undefined') {
				router.replace('/login');
			}
		}
	}

	useEffect(() => {
		fetchUser().then(() => {});
	}, []);

	return { user, loading };
}
