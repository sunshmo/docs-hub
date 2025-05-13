import React from 'react';
import { ModelModule } from '@/components/model-module/model-module';

export default function Model() {
	return (
		<div className="flex flex-col h-[calc(100vh-4rem)] w-full">
			<div className="flex-1 overflow-y-auto">
				<ModelModule></ModelModule>
			</div>
		</div>
	);
}
