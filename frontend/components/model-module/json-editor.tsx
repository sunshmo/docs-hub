import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import JSONEditor, { JSONEditorOptions } from 'jsoneditor';
import { diff } from 'deep-diff';
import 'jsoneditor/dist/jsoneditor.css';

interface JsonEditorProps {
	value?: string;
	onChange?: (json: object, diff: any[]) => void;
	className?: string;
	height?: number | string;
	showDiff?: boolean;
}

const JsonEditor: React.FC<JsonEditorProps> = ({
	value = '{}',
	onChange,
	className = '',
	height = 260,
	showDiff = true,
}) => {
	const { t, i18n } = useTranslation('model');
	const [currentJson, setCurrentJson] = useState<object>({});
	const [originalJson, setOriginalJson] = useState<object>({});
	const [diffs, setDiffs] = useState<any[]>([]);
	const [error, setError] = useState<string | null>(null);

	const editorRef = useRef<HTMLDivElement>(null);
	const jsonEditorRef = useRef<JSONEditor | null>(null);

	// Initialize editor and parse default value
	useEffect(() => {
		try {
			const initialJson = value?.trim() ? JSON.parse(value) : {};
			setCurrentJson(initialJson);
			setOriginalJson(JSON.parse(JSON.stringify(initialJson))); // Deep clone
			setError(null);
			setDiffs([]);
		} catch (err) {
			setError(t('invalidInitialJson'));
			console.error('Initial JSON parsing error:', err);
		}
	}, [value]);

	// Initialize JSON editor
	useEffect(() => {
		if (!editorRef.current) return;

		const options: JSONEditorOptions = {
			language: i18n.language,
			mode: 'tree',
			modes: ['tree', 'code', 'form', 'text', 'view'],
			onChange: () => {
				try {
					if (jsonEditorRef.current) {
						const updatedJson = jsonEditorRef.current.get();
						const differences = diff(originalJson, updatedJson);

						setCurrentJson(updatedJson);
						setDiffs(differences || []);
						setError(null);
						onChange?.(updatedJson, differences || []);
					}
				} catch (err) {
					setError(t('invalidJson'));
					console.error('JSON parsing error:', err);
				}
			},
			onValidationError: (errors) => {
				// @ts-expect-error
				setError(errors.map((err) => err.message).join('\n'));
			},
		};

		jsonEditorRef.current = new JSONEditor(editorRef.current, options);
		jsonEditorRef.current.set(currentJson);

		return () => {
			jsonEditorRef.current?.destroy();
		};
	}, [i18n.language, originalJson]);

	// Format diff for display
	const renderDiff = () => {
		if (!diffs || diffs.length === 0) {
			return (
				<div className="p-2 text-gray-500">{t('noChanges')}</div>
			);
		}

		return (
			<div className="p-2">
				{diffs.map((change, index) => {
					const path = change.path?.join('.') || 'root';

					return (
						<div key={index} className="mb-1 text-sm">
							<span className="font-medium">{path}:</span>
							{change.kind === 'E' && (
								<span>
									<span className="line-through text-red-500 mx-1">
										{JSON.stringify(change.lhs)}
									</span>
									<span>→</span>
									<span className="text-green-600 mx-1">
										{JSON.stringify(change.rhs)}
									</span>
								</span>
							)}
							{change.kind === 'N' && (
								<span className="text-green-600">
									+ {JSON.stringify(change.rhs)}
								</span>
							)}
							{change.kind === 'D' && (
								<span className="text-red-500">
									- {JSON.stringify(change.lhs)}
								</span>
							)}
						</div>
					);
				})}
			</div>
		);
	};

	const editorStyle = {
		height: typeof height === 'number' ? `${height}px` : height,
	};

	return (
		<div
			className={`flex flex-col border rounded overflow-hidden ${className}`}
		>
			<div className="flex flex-1">
				<div ref={editorRef} className="flex-1 border-r" style={editorStyle} />

				<div className="flex-1 overflow-auto" style={editorStyle}>
					<div className="sticky top-0 bg-gray-100 dark:bg-gray-700 p-2 font-medium flex justify-between">
						<span>
							{showDiff ? t('changes') : t('currentData')}
						</span>
					</div>

					{showDiff ? (
						renderDiff()
					) : (
						<pre className="p-2 text-sm">
							{JSON.stringify(currentJson, null, 2)}
						</pre>
					)}
				</div>
			</div>

			{error && (
				<div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 text-sm">
					{error}
				</div>
			)}
		</div>
	);
};

export default JsonEditor;
