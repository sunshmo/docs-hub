'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import JSEncrypt from 'jsencrypt';

export default function LoginPage() {
	const router = useRouter();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	async function handleLogin(e: React.FormEvent) {
		e.preventDefault();
		const res = await fetch('/api/auth/public-key');
		const { data: publicKey } = await res.json();

		const encrypt = new JSEncrypt();
		encrypt.setPublicKey(publicKey);
		const encryptedPassword = encrypt.encrypt(password.trim());

		if (!encryptedPassword) {
			throw new Error('Encryption failed');
		}

		fetch('/api/auth/login', {
			method: 'post',
			body: JSON.stringify({
				username,
				password: encryptedPassword,
			}),
		})
			.then((res) => res.json())
			.then(({ data: { accessToken } }) => {
				router.push(
					`/api/auth/callback?token=${accessToken}&returnUri=${encodeURIComponent('http://localhost:3000')}`,
				);
			});
	}

	async function authCodeLogin(e: React.FormEvent) {
		e.preventDefault();
		const res = await fetch('/api/auth/public-key');
		const { data: publicKey } = await res.json();

		const encrypt = new JSEncrypt();
		encrypt.setPublicKey(publicKey);
		const encryptedPassword = encrypt.encrypt(password.trim());

		if (!encryptedPassword) {
			throw new Error('Encryption failed');
		}

		fetch('/api/auth/login', {
			method: 'post',
			body: JSON.stringify({
				username,
				password: encryptedPassword,
			}),
		})
			.then((res) => res.json())
			.then(({ data: { accessToken } }) => {
				fetch('/api/auth/auth-code', {
					headers: {
						authorization: `Bearer ${accessToken}`,
					},
					method: 'post',
					body: JSON.stringify({}),
				})
					.then((res) => res.json())
					.then(({ data: code }) => {
						router.push(
							`/api/auth/callback?code=${code}&returnUri=${encodeURIComponent('http://localhost:3000')}`,
						);
					});
			});
	}

	return (
		<div>
			<form onSubmit={handleLogin}>
				<h1>Login</h1>
				<input
					type="text"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder="username"
					required
				/>
				<input
					type="text"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="password"
					required
				/>
				<button type="submit">Login</button>
			</form>
			<form onSubmit={authCodeLogin}>
				<h1>Login</h1>
				<input
					type="text"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder="username"
					required
				/>
				<input
					type="text"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="password"
					required
				/>
				<button type="submit">auth code login</button>
			</form>
		</div>
	);
}
