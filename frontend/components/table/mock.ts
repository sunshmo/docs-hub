import { ColumnsDefine, ListTableConstructorOptions } from '@visactor/vtable';

function generateRandomString(length: number) {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
}

function generateRandomHobbies() {
	const hobbies = [
		'Reading books',
		'Playing video games',
		'Watching movies',
		'Cooking',
		'Hiking',
		'Traveling',
		'Photography',
		'Playing musical instruments',
		'Gardening',
		'Painting',
		'Writing',
		'Swimming',
	];

	const numHobbies = Math.floor(Math.random() * 3) + 1; // 生成 1-3 之间的随机整数
	const selectedHobbies = [];

	for (let i = 0; i < numHobbies; i++) {
		const randomIndex = Math.floor(Math.random() * hobbies.length);
		const hobby = hobbies[randomIndex];
		selectedHobbies.push(hobby);
		hobbies.splice(randomIndex, 1); // 确保每个爱好只选一次
	}

	return selectedHobbies.join(', ');
}

function generateRandomBirthday() {
	const start = new Date('1970-01-01');
	const end = new Date('2000-12-31');
	const randomDate = new Date(
		start.getTime() + Math.random() * (end.getTime() - start.getTime()),
	);
	const year = randomDate.getFullYear();
	const month = randomDate.getMonth() + 1;
	const day = randomDate.getDate();
	return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
}

function generateRandomPhoneNumber() {
	const areaCode = [
		'130',
		'131',
		'132',
		'133',
		'134',
		'135',
		'136',
		'137',
		'138',
		'139',
		'150',
		'151',
		'152',
		'153',
		'155',
		'156',
		'157',
		'158',
		'159',
		'170',
		'176',
		'177',
		'178',
		'180',
		'181',
		'182',
		'183',
		'184',
		'185',
		'186',
		'187',
		'188',
		'189',
	];
	const prefix = areaCode[Math.floor(Math.random() * areaCode.length)];
	const suffix = String(Math.random()).substr(2, 8);
	return prefix + suffix;
}

export function generatePersons(count: number) {
	return Array.from(new Array(count)).map((_, i) => {
		const first = generateRandomString(10);
		const last = generateRandomString(4);
		return {
			id: i + 1,
			email1: `${first}_${last}@xxx.com`,
			name: first,
			lastName: last,
			hobbies: generateRandomHobbies(),
			birthday: generateRandomBirthday(),
			tel: generateRandomPhoneNumber(),
			sex: i % 2 === 0 ? 'boy' : 'girl',
			work: i % 2 === 0 ? 'back-end engineer' : 'front-end engineer',
			city: 'beijing',
		};
	});
}

const columns: ColumnsDefine | ColumnsDefine[] = [
	{
		field: 'id',
		title: 'ID',
		width: 80,
		sort: true,
	},
	{
		field: 'email1',
		title: 'email',
		width: 250,
		sort: false,
	},
	{
		field: 'full name',
		title: 'Full name',
		// @ts-expect-error 特此备注
		columns: [
			{
				field: 'name',
				title: 'First Name',
				width: 140,
			},
			{
				field: 'lastName',
				title: 'Last Name',
				width: 140,
			},
		],
	},
	{
		field: 'hobbies',
		title: 'hobbies',
		width: 200,
	},
	{
		field: 'birthday',
		title: 'birthday',
		width: 120,
	},
	{
		field: 'sex',
		title: 'sex',
		width: 100,
	},
	{
		field: 'tel',
		title: 'telephone',
		width: 150,
	},
	{
		field: 'work',
		title: 'job',
		width: 200,
	},
	{
		field: 'city',
		title: 'city',
		width: 150,
	},
];

export const mockData: ListTableConstructorOptions = {
	records: generatePersons(10000),
	// @ts-expect-error 忽略错误
	columns,
};
