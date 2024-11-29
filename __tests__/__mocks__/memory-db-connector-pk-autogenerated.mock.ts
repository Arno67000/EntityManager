import type { AsyncStorageConnector, EntityProto, PrimaryKey } from '../../src/types';
import { randomUUID } from 'node:crypto';

export class InMemoryDatabase<T, K extends PrimaryKey<T>> implements AsyncStorageConnector<T, K> {
	#database: Map<string, T[]>;

	constructor() {
		this.#database = new Map<string, T[]>();
	}

	async get_connection(table_name: string) {
		return this.#database.has(table_name) || Boolean(this.#database.set(table_name, []));
	}

	async health_check(table_name: string) {
		return this.#database.has(table_name);
	}

	async insert(obj: EntityProto<T, K>, table_name: string) {
		const storage = this.#database.get(table_name);
		if (!storage) return storage;
		return await new Promise<T[K]>((resolve) => {
			const uid = randomUUID();
			storage.push({ ...obj, id: String(uid) } as T);

			this.#database.set(table_name, storage);
			resolve(uid as T[K]);
		});
	}

	async remove(pk: [K, T[K]], table_name: string) {
		const [key, value] = pk;
		const storage = this.#database.get(table_name);
		if (!storage) return false;
		return await new Promise<boolean>((resolve) => {
			const index = storage.findIndex((e) => e[key] === value);
			if (index === -1) resolve(false);
			storage.splice(index, 1);
			this.#database.set(table_name, storage);
			resolve(true);
		});
	}

	async get(pk: [K, T[K]], table_name: string) {
		const [key, value] = pk;
		const storage = this.#database.get(table_name);
		if (!storage) return storage;
		return await new Promise<T | undefined>((resolve) => {
			const index = storage.findIndex((e) => e[key] === value);
			if (index === -1) resolve(undefined);
			resolve(storage[index]);
		});
	}

	async close_connection() {
		return;
	}
}

export class InMemoryDatabaseNotReady<T, K extends PrimaryKey<T>> extends InMemoryDatabase<T, K> {
	override async health_check(table_name: string): Promise<boolean> {
		return false;
	}
}

export class InMemoryDatabaseCreationFail<T, K extends PrimaryKey<T>> extends InMemoryDatabase<T, K> {
	override async insert(_obj: EntityProto<T, K>, _table_name: string) {
		return undefined;
	}
}
