interface SortOrder {
	table: string;
	field: string;
	order: 'asc' | 'desc' | undefined;
}

// `ORDER BY table1.field1,table2.field2 DESC, table2.field3 ASC`
export function getOrderBy(orders: SortOrder[]): string {
	let orderBy = '';

	if (Array.isArray(orders)) {
		// 降序
		let od: string[] = [];
		// 升序
		let oa: string[] = [];

		for (const item of orders) {
			const { order = 'asc', field, table } = item;
			if (!order) {
				oa.push(`${table}.${field}`);
			} else {
				if (order.toLowerCase() === 'asc') {
					oa.push(`${table}.${field}`);
				} else {
					od.push(`${table}.${field}`);
				}
			}
		}

		if (od.length) {
			orderBy += `${od.join(',')} DESC `;
		}
		if (oa) {
			orderBy += `${oa.join(',')} ASC `;
		}

		if (oa || od) {
			orderBy = `ORDER BY ${orderBy}`;
		}
	}

	return orderBy;
}
