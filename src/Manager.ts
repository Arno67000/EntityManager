import { Builder } from './Builder';
import type { DatabaseInfo, EntityBuilder, EntityManager, EntityProto, PrimaryKey } from './types';

export class Manager<T, K extends PrimaryKey<T>> implements EntityManager<T, K> {
	readonly #builders: Map<symbol, EntityBuilder<T, K>>;
	readonly #localRepo: Map<symbol, T>;
	readonly #database?: DatabaseInfo<T, K>;
	readonly #primary_key?: K;

	constructor(
		database_info?: DatabaseInfo<T, K>,
		pk?: K,
		private readonly EntityBuilder = Builder,
	) {
		this.#builders = new Map<symbol, EntityBuilder<T, K>>();
		this.#localRepo = new Map<symbol, T>();

		if (database_info) {
			this.#database = database_info;
		}

		if (pk) {
			this.#primary_key = pk;
		}
	}

	#assert_builder_is_unique(symbol: symbol) {
		if (this.#builders.get(symbol)) {
			throw new Error(`Duplicate builder for symbol: ${String(symbol)}`);
		}
	}

	#retrieve_builder(symbol: symbol): EntityBuilder<T, K> {
		const builder = this.#builders.get(symbol);
		if (!builder) {
			throw new Error(`Missing builder for symbol: ${String(symbol)}`);
		}
		return builder;
	}

	#retrieve_entity(symbol: symbol): T {
		const entity = this.#localRepo.get(symbol);
		if (!entity) {
			throw new Error(`Missing entity for symbol: ${String(symbol)}`);
		}
		return entity;
	}

	#assert_unique_PK(uniqueIdentifiers: [K, T[K]] | []) {
		const [key, value] = uniqueIdentifiers;
		if (
			key &&
			value &&
			Array.from(this.#localRepo.values()).some(
				(entity) => entity && typeof entity === 'object' && Reflect.get(entity, key) === value,
			)
		) {
			throw new Error(`Primary key constraint error: value ${value} already exists`);
		}
	}

	#assert_PK_validity(uniqueIdentifiers: [K, T[K]] | []) {
		if (this.#database) {
			if (!this.#database.PK_auto_generated && !uniqueIdentifiers.length) {
				throw new Error('Fatal Error: Missing Primary Key');
			}
			if (this.#database.PK_auto_generated && uniqueIdentifiers.length) {
				throw new Error('Fatal Error: Can not override Primary Key auto_generated');
			}
		} else if (this.#primary_key) {
			if (!uniqueIdentifiers.length) {
				throw new Error('Fatal Error: Missing Primary Key');
			}
			if (uniqueIdentifiers[0] !== this.#primary_key) {
				throw new Error('Fatal Error: Can not override existing Primary Key');
			}
		}
	}

	async #assert_database_ready() {
		if (this.#database) {
			return await this.#database.connector.health_check(this.#database.table_name);
		}
		return false;
	}

	/**
	 * @description Clean the manager and all the necessary related resources (databases, ...), drop all builders and stored symbols
	 */
	async clean() {
		this.#builders.clear();

		if (this.#database && (await this.#assert_database_ready())) {
			for (const symbol of Array.from(this.#localRepo.keys())) {
				await this.remove(symbol);
			}
			await this.#database.connector.close_connection();
		}

		this.#localRepo.clear();
	}

	/**
	 * @description Create and return a builder for the Entity
	 * @param symbol Unique identifier to manage the Entity
	 * @param constructor Class to instanciate all the required default values for the Entity
	 * @returns EntityBuilder
	 */
	create(symbol: symbol, ctor: new () => EntityProto<T, K>) {
		this.#assert_builder_is_unique(symbol);
		this.#builders.set(symbol, new this.EntityBuilder(ctor));
		return this.#retrieve_builder(symbol);
	}

	/**
	 * @description Compute the Entity prototype to an actual Entity, save it to the storage and return it
	 * @param symbol Unique identifier to manage the Entity
	 * @param uniqueIdentifier Optional object containing your entity primary key and its value (usefull if no auto-generated identifier for the table)
	 * @returns T
	 */
	async save(symbol: symbol, uniqueIdentifier?: [K, T[K]]) {
		let pk = uniqueIdentifier ?? [];
		this.#assert_PK_validity(pk);

		const proto = this.#retrieve_builder(symbol).compute();

		if (this.#database && (await this.#assert_database_ready())) {
			const insertable = proto;
			pk.length && Object.assign(insertable, { [pk[0]]: pk[1] });

			const createdIdentifier = await this.#database.connector.insert(insertable);
			if (!createdIdentifier && this.#database.PK_auto_generated) {
				throw new Error('Database Insertion Error: no new element created');
			}

			this.#database.PK_auto_generated &&
				createdIdentifier &&
				(pk = [this.#database.primary_key, createdIdentifier]);
		} else if (!this.#database && this.#primary_key) {
			this.#assert_unique_PK(pk);
		}

		const entity = { ...proto, ...(pk.length && { [pk[0]]: pk[1] }) } as T;
		this.#localRepo.set(symbol, entity);
		return Object.freeze(entity);
	}

	/**
	 * @description Removes the Entity identified by the symbol from the storage and/or the database
	 * @param symbol Unique identifier to manage the Entity
	 */
	async remove(symbol: symbol) {
		if (this.#database && (await this.#assert_database_ready())) {
			const pk = this.#retrieve_entity(symbol)[this.#database.primary_key];
			await this.#database.connector.remove(pk);
		}
		this.#localRepo.delete(symbol);
	}

	/**
	 * @description Retrieve an entity from the storage and/or the database by its unique identifier
	 * @param symbol Unique identifier to manage the Entity
	 */
	async get(symbol: symbol) {
		if (this.#database && (await this.#assert_database_ready())) {
			const pk = this.#retrieve_entity(symbol)[this.#database.primary_key];
			return await this.#database.connector.get(pk);
		}

		return this.#localRepo.get(symbol);
	}
}
