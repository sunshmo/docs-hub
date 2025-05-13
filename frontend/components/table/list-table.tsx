'use client';

import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react';
import { ListTable } from '@visactor/vtable';

import type { ColumnsDefine } from '@visactor/vtable/es/ts-types/list-table';
import request from '@/request';
import { cn } from '@/lib/utils';
import type { ListTableConstructorOptions } from '@visactor/vtable/es/ts-types';

interface IProps {
	className?: string;
	url?: string;
	body?: BodyInit;
	onSuccess?: (res: Response) => Response;
	onError?: (err: Error) => void;
	onFinally?: () => void;
	onGetInstance?: (instance: ListTable) => void;
	columns?: ColumnsDefine;
	options?: ListTableConstructorOptions;
}

export default forwardRef(function VListTable(props: IProps, ref) {
	const {
		className,
		url,
		body,
		onSuccess,
		onError,
		onFinally,
		onGetInstance,
		columns,
		options,
	} = props;

	const tableRef = useRef<HTMLDivElement>(null);
	const [instance, setInstance] = useState<ListTable>();
	const [records, setRecords] = useState<ColumnsDefine>([]);

	const onQuery = (params?: BodyInit) => {
		params = params || body;
		if (!url) return;
		request(url, {
			method: 'post',
			body: JSON.stringify(params || {}),
		})
			.then((res) => res.json())
			.then((res) => res.data)
			.then((res) => {
				setRecords(Array.isArray(res) ? res : []);
				if (typeof onSuccess === 'function') {
					onSuccess(res);
				}
			})
			.catch(onError)
			.finally(onFinally);
	};

	useImperativeHandle(
		ref,
		() => ({
			onGetInstance: () => instance,
			load: onQuery,
		}),
		[instance, onQuery],
	);

	useEffect(() => {
		if (typeof window === 'undefined' || !tableRef.current) return;

		if (!instance) {
			import('@visactor/vtable').then(({ ListTable }) => {
				const tableInstance: ListTable = new ListTable({
					container: tableRef.current,
					// records,
					columns,
					widthMode: 'adaptive',
					...options,
				});
				if (typeof onGetInstance === 'function') {
					onGetInstance(tableInstance);
				}
				setInstance(tableInstance);
			});
		}
	}, []);

	useEffect(() => {
		onQuery();
	}, []);

	useEffect(() => {
		if (instance) {
			instance.setRecords(records);
		}
	}, [records, instance]);

	return <div ref={tableRef} className={cn('w-full', className)}></div>;
});
