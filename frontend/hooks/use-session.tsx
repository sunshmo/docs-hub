'use client';

/**
 * 管理会话列表
 */

import React, { useEffect, useMemo, useState } from 'react';
import request from '@/request';
import { useSearchParams } from 'next/navigation';
import { Session } from 'docs-hub-shared-models';

interface FileContext {
	sessionList: Session[];
	setSessionList: (values: []) => void;
	load: () => void;
	sessionId: string | null;
}

const FileContext = React.createContext<FileContext | null>(null);

function useSession() {
	const context = React.useContext(FileContext);
	if (!context) {
		throw new Error('useSession must be used within a SessionProvider.');
	}

	return context;
}

function SessionProvider({
	defaultValues = [],
	children,
	setSessionList,
	onLoad,
}: React.ComponentProps<'div'> & {
	defaultValues?: [];
	setSessionList?: (values: []) => void;
	onLoad?: () => void;
}) {
	const searchParams = useSearchParams();
	const [list, setList] = useState(defaultValues);

	const setDataSource = setSessionList ?? setList;
	const loadFunc = onLoad ?? getSessionList;
	const sessionId = searchParams.get('sessionId');

	const contextValue: FileContext = useMemo<FileContext>(
		() => ({
			sessionList: list,
			setSessionList: setDataSource,
			load: loadFunc,
			sessionId,
		}),
		[list, setDataSource, loadFunc, sessionId],
	);

	function getSessionList() {
		request('/api/session/id', {
			method: 'post',
			body: JSON.stringify({}),
		})
			.then((res) => res.json())
			.then((res) => {
				setDataSource(res?.data || []);
			});
	}

	useEffect(() => {
		// getSessionList();
	}, []);

	return (
		<FileContext.Provider value={contextValue}>{children}</FileContext.Provider>
	);
}

export { useSession, SessionProvider };
