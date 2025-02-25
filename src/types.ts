export type PrimaryKey<T> = keyof T;

export type EntityProto<T, K extends PrimaryKey<T>> = Omit<T, K>;

export type EntityBuilder<T, K extends PrimaryKey<T>> = {
	/**
	 * @description Build and return the EntityProto
	 */
	compute(): EntityProto<T, K>;

	/**
	 * @description Set values in the EntityProto and return EntityBuilder
	 * @param key The key to target in the EntityProto (type-safe)
	 * @param value The value to assign to the key (type-safe)
	 * @returns EntityBuilder
	 */
	set<Y extends keyof EntityProto<T, K>>(key: Y, value: EntityProto<T, K>[Y]): EntityBuilder<T, K>;
};

export type EntityManager<T, K extends PrimaryKey<T> = never> = {
	/**
	 * @description Connect database, pool ...
	 * @returns boolean
	 */
	connect(): Promise<boolean>;

	/**
	 * @description Clean the manager and all the necessary related resources (databases, ...), drop all builders and stored symbols
	 */
	clean(): Promise<void> | void;

	/**
	 * @description Create and return a builder for the Entity
	 * @param symbol Unique identifier to manage the Entity
	 * @param constructor Class to instanciate all the required default values for the Entity
	 * @returns EntityBuilder
	 */
	create(symbol: symbol, constructor: new () => EntityProto<T, K>): EntityBuilder<T, K>;

	/**
	 * @description Removes the Entity identified by the symbol from the storage and/or the database
	 * @param symbol Unique identifier to manage the Entity
	 */
	remove(symbol: symbol): Promise<boolean> | boolean;

	/**
	 * @description Compute the Entity prototype to an actual Entity, save it to the storage and return it
	 * @param symbol Unique identifier to manage the Entity
	 * @param uniqueIdentifier Optional contains your entity primary key and its value (usefull if no auto-generated identifier for the table)
	 * @returns T
	 */
	save(symbol: symbol, uniqueIdentifier?: [K, T[K]]): Promise<Readonly<T>> | Readonly<T>;

	/**
	 * @description Retrieve an entity from the storage and/or the database by its unique identifier
	 * @param symbol Unique identifier to manage the Entity
	 */
	get(symbol: symbol): Promise<T | undefined> | T | undefined;
};

export type AsyncStorageConnector<T, K extends PrimaryKey<T>> = {
	/**
	 * @description Implementation of a health check function
	 * @param table_name The name of the table to query on
	 * @returns true if the database is up and ready & connector is connected to the database & the table exists else return false
	 */
	health_check: (table_name: string) => Promise<boolean>;

	/**
	 * @description Function to insert object into table
	 * @param obj Entity prototype to save in database
	 * @param table_name The name of the table to query on
	 * @returns newly created identifier (Primary key, id, uuid, ...) or undefined if not generated by the database
	 */
	insert: (obj: EntityProto<T, K>, table_name: string) => Promise<T[K] | undefined>;

	/**
	 * @description Function to delete object from table
	 * @param pk Value of the Entity's primary key
	 * @param table_name The name of the table to query on
	 * @returns boolean
	 */
	remove: (pk: [K, T[K]], table_name: string) => Promise<boolean>;

	/**
	 * @description Function to retrieve object from table
	 * @param pk Value of the Entity's primary key
	 * @param table_name The name of the table to query on
	 * @returns The required Entity if exists
	 */
	get: (pk: [K, T[K]], table_name: string) => Promise<T | undefined>;

	/**
	 * @description Function to close the database connection, pool, ...
	 * @returns Promise<void> resolves ONLY when connection is closed
	 * @warn May create conflicts and/or openHandles if returns before connection is closed
	 */
	close_connection: () => Promise<void>;

	/**
	 * @description Function to get the database connection, pool, ...
	 * @returns Promise<void> resolves ONLY when connection is ready
	 */
	get_connection: (table_name: string) => Promise<boolean>;
};

export type DatabaseTableInfo<T, K extends PrimaryKey<T>> = {
	connector: AsyncStorageConnector<T, K>;
	table_name: string;
	primary_key: K;
	PK_auto_generated: boolean;
};

export type LocalStoreInfo<T, K extends PrimaryKey<T>> = { primary_key?: K };
