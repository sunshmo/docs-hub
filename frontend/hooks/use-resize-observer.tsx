import React, { useEffect, useRef, useCallback, RefObject } from 'react';

// 定义回调函数类型
type ResizeObserverCallback = (entry: ResizeObserverEntry) => void;

// 自定义 Hook
function useResizeObserver<T extends HTMLElement>(
	callback: ResizeObserverCallback,
	options?: ResizeObserverOptions,
): React.RefObject<T> {
	const ref = useRef<T>(null) as RefObject<T>;

	// 使用 useCallback 缓存回调函数
	const memoizedCallback = useCallback(
		(entries: ResizeObserverEntry[]) => {
			if (entries.length > 0) {
				callback(entries[0]);
			}
		},
		[callback],
	);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		const observer = new ResizeObserver(memoizedCallback);
		observer.observe(element, options);

		return () => {
			observer.unobserve(element);
			observer.disconnect();
		};
	}, [memoizedCallback, options]);

	return ref;
}

type DebouncedResizeCallback = (entry: ResizeObserverEntry) => void;

function useDebouncedResizeObserver<T extends HTMLElement>(
	callback: DebouncedResizeCallback,
	delay: number = 100,
	options?: ResizeObserverOptions,
): React.RefObject<T> {
	const ref = useRef<T>(null) as RefObject<T>;
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const lastSizeRef = useRef<{ width: number; height: number } | null>(null);

	// 使用 useCallback 缓存防抖函数
	const debouncedCallback = useCallback(
		(entry: ResizeObserverEntry) => {
			const { width, height } = entry.contentRect;
			const lastSize = lastSizeRef.current;

			// 只有当尺寸实际发生变化时才触发回调
			if (!lastSize || lastSize.width !== width || lastSize.height !== height) {
				lastSizeRef.current = { width, height };

				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
				}

				timeoutRef.current = setTimeout(() => {
					callback(entry);
				}, delay);
			}
		},
		[callback, delay],
	);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
			if (entries.length > 0) {
				debouncedCallback(entries[0]);
			}
		});

		observer.observe(element, options);

		return () => {
			observer.unobserve(element);
			observer.disconnect();
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [debouncedCallback, options]);

	return ref;
}

export { useResizeObserver, useDebouncedResizeObserver };
