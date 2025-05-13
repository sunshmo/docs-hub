const excludeKeys = ['deleted', 'deletedAt'];

export function sqlDataFilter<T>(target: T, keys?: string[]) {
	if (!target) {
		return {};
	}

	// 默认过滤
	if (!Array.isArray(keys)) {
		const res: Record<string, any> = {};
		for (const key in target) {
			if (excludeKeys.includes(key)) continue;
			res[key] = target[key];
		}
		return res;
	}

	return keys.reduce((previousValues, key) => {
		if (!excludeKeys.includes(key)) {
			previousValues[key] = target[key];
		}
		return previousValues;
	}, {});
}

export function filterArray<T>(list: T[], keys?: string[]) {
	if (!Array.isArray(list)) {
		return [];
	}

	// 默认过滤
	if (!Array.isArray(keys)) {
		const res: Record<string, any> = [];
		for (const item of list) {
			const data: Record<string, any> = {};
			for (const key in item) {
				if (excludeKeys.includes(key)) continue;
				data[key] = item[key];
			}
			res.push(data);
		}
		return res;
	}

	return list.reduce((previousValues: Record<string, any>[], current) => {
		const item: Record<string, any> = {};
		for (const key of keys) {
			item[key] = current[key];
		}
		previousValues.push(item);
		return previousValues;
	}, []);
}
