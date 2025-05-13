import { hashSync, compareSync, genSaltSync } from 'bcryptjs';
import JSEncrypt from 'jsencrypt';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

const PEPPER = process.env.PEPPER_SECRET || 'default-pepper';

const privateKeyPath = join(process.cwd(), 'private/private.pem');
const privateKey = readFileSync(privateKeyPath, 'utf8');

/**
 * 加密密码（用于注册）
 * @param plainPassword 明文密码
 * @returns bcrypt 哈希值
 */
export function hashPassword(plainPassword: string): string {
	const saltedPassword = plainPassword + PEPPER; // 加 PEPPER
	const salt = genSaltSync(12); // 自动生成 salt
	return hashSync(saltedPassword, salt);
}

/**
 * 读取私钥、解密。解密 RSA 加密的密码（用于登录）
 * @param encryptedPassword 前端 RSA 加密后的密码
 * @returns 明文密码（或 false 解密失败）
 */
export function decryptPassword(encryptedPassword: string): string | false {
	const decrypt = new JSEncrypt();
	decrypt.setPrivateKey(privateKey);
	return decrypt.decrypt(encryptedPassword);
}

/**
 * 验证密码（用于登录）
 * @param decryptedPassword RSA 解密后的明文密码
 * @param hashedPassword 数据库存储的 bcrypt 哈希值
 * @returns 是否匹配
 */
export function comparePassword(
	decryptedPassword: string,
	hashedPassword: string,
): boolean {
	const saltedPassword = decryptedPassword + PEPPER; // 加同样的 PEPPER
	return compareSync(saltedPassword, hashedPassword); // 用 bcrypt 比较
}
