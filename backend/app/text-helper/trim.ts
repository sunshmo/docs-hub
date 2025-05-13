export function removeXmlTags(text: string) {
	// '<div>Hello <b>World</b></div>' --> "Hello World"
	return text.replace(/<[^>]+>/g, '');
}

export function replaceNewlineChar(str: string) {
	// 换行符
	return str.replace(/[\r\n]+/g, '\n');
}

// 替换所有的空白字符
export function trim(str: string) {
	// 换行符、多个空格、制表符
	return str.replace(/\s+/g, ' ');
}

export function trimEnd(str: string) {
	// 替换两端的空白字符：换行符、多个空格、制表符
	return str.replace(/(^\s+)|(\s+$)/g, ' ');
}
