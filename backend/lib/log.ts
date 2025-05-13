type LogEvent = {
	event: string;
	message: string;
	userId?: string;
	level?: 'INFO' | 'WARN' | 'ERROR';
	metadata?: Record<string, any>;
};

export function logSecurityEvent(params: LogEvent) {
	try {
		console.log(params);
	} catch (error) {
		console.error('Failed to write security log:', error);
	}
}
