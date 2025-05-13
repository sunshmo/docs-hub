import { PoolConnection } from 'mysql2/promise';
import db from './db';

/**
 * 封装事务逻辑，自动处理 begin, commit, rollback, release
 * @param fn - 事务执行函数，接收一个连接对象
 * @returns 返回事务函数的执行结果
 */
export async function withTransaction<T>(
	fn: (conn: PoolConnection) => Promise<T>,
): Promise<T> {
	const connection = await db.getConnection();

	try {
		await connection.beginTransaction();
		const result = await fn(connection);
		await connection.commit();
		return result;
	} catch (err) {
		await connection.rollback();
		throw err;
	} finally {
		// 一定得释放，否则会挂
		connection.release();
	}
}
