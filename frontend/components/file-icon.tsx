import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faFileCode,
	faFilePdf,
	faFileImage,
	faFileAudio,
	faFile,
	faFolder,
	faFolderBlank,
	faFolderOpen,
	faFolderClosed,
	faFolderPlus,
	faFolderMinus,
} from '@fortawesome/free-solid-svg-icons';

// 定义一个函数根据文件扩展名返回对应的图标
const getFileIcon = (filename: string) => {
	if (!filename) {
		return <FontAwesomeIcon icon={faFile} style={{ color: '#757575' }} />; // Default file icon
	} else {
		// @ts-expect-error
		const extension = filename.split('.').pop().toLowerCase();
		switch (extension) {
			case 'py':
				return (
					<FontAwesomeIcon icon={faFileCode} style={{ color: '#306998' }} />
				); // Python
			case 'js':
				return (
					<FontAwesomeIcon icon={faFileCode} style={{ color: '#f7df1e' }} />
				); // JavaScript
			case 'html':
				return (
					<FontAwesomeIcon icon={faFileCode} style={{ color: '#e34c26' }} />
				); // HTML
			case 'css':
				return (
					<FontAwesomeIcon icon={faFileCode} style={{ color: '#264de4' }} />
				); // CSS
			case 'pdf':
				return (
					<FontAwesomeIcon icon={faFilePdf} style={{ color: '#d32f2f' }} />
				); // PDF
			case 'jpg':
			case 'jpeg':
			case 'png':
				return (
					<FontAwesomeIcon icon={faFileImage} style={{ color: '#ff9800' }} />
				); // Image
			case 'mp3':
			case 'wav':
				return (
					<FontAwesomeIcon icon={faFileAudio} style={{ color: '#00bcd4' }} />
				); // Audio
			default:
				return <FontAwesomeIcon icon={faFile} style={{ color: '#f7df1e' }} />; // Default file icon
		}
	}
};

interface IIconProps extends React.HTMLAttributes<HTMLSpanElement> {
	filename: string;
}

export const FileIcon = ({ filename, ...rest }: IIconProps) => (
	<span {...rest}>{getFileIcon(filename)}</span>
);

export const FolderIcon = ({ type }: { type?: string }) => {
	let icon = faFolder;
	switch (type) {
		case 'fold-blank':
			icon = faFolderBlank;
			break;
		case 'fold-open':
			icon = faFolderOpen;
			break;
		case 'fold-close':
			icon = faFolderClosed;
			break;
		case 'fold-plus':
			icon = faFolderPlus;
			break;
		case 'fold-minus':
			icon = faFolderMinus;
			break;
	}
	return <FontAwesomeIcon icon={icon} style={{ color: '#757575' }} />;
};
