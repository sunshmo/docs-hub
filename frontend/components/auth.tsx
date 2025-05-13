'use client';

import { memo, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';

const Auth = memo(({ children }: { children?: ReactNode }) => {
	const auth = useAuth();

	return children;
});

export { Auth };
