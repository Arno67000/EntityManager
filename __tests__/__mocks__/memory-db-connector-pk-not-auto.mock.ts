import type { AsyncStorageConnector, EntityProto, PrimaryKey } from '../../src/types';

export class InMemoryDatabaseManual<T, K extends PrimaryKey<T>> implements AsyncStorageConnector<T, K> {
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
		return await new Promise<T[K] | undefined>((resolve) => {
			storage.push({ ...obj } as T);

			this.#database.set(table_name, storage);
			resolve(undefined);
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
