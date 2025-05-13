import React, { useEffect, useState } from 'react';

export function useAutoScrollToBottom(
	ref: React.RefObject<HTMLElement | null>,
) {
	const [autoScroll, setAutoScroll] = useState(true);

	useEffect(() => {
		const container = ref.current;
		if (!container) return;

		const handleScroll = () => {
			const isAtBottom =
				container.scrollHeight - container.scrollTop <=
				container.clientHeight + 50;
			setAutoScroll(isAtBottom);
		};

		container.addEventListener('scroll', handleScroll);
		return () => container.removeEventListener('scroll', handleScroll);
	}, [ref]);

	useEffect(() => {
		const container = ref.current;
		if (!container || !autoScroll) return;

		const observer = new MutationObserver(() => {
			requestAnimationFrame(() => {
				container.scrollTo({
					top: container.scrollHeight,
					behavior: 'smooth',
				});
			});
		});

		observer.observe(container, {
			childList: true,
			subtree: true,
		});

		return () => observer.disconnect();
	}, [ref, autoScroll]);
}
