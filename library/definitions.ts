type PrimaryKey = 'id' | 'uid';

export type EntityProto<T extends { [P in PrimaryKey]: string | number }> = Omit<T, PrimaryKey>;

export type EntityBuilder<T extends { [P in PrimaryKey]: string | number }, E = EntityProto<T>> = {
    /**
     * @description Build and return the EntityProto
     */
    compute(): EntityProto<T>;

    /**
     * @description Set values in the EntityProto and return EntityBuilder
     * @param key The key to target in the EntityProto (type-safe)
     * @param value The value to assign to the key (type-safe)
     * @returns EntityBuilder
     */
    set<K extends keyof E>(key: K, value: E[K]): EntityBuilder<T>;
}

export type EntityManager<T extends { [P in PrimaryKey]: string | number }> = {

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
    create(symbol: symbol, constructor: new () => EntityProto<T>): EntityBuilder<T>;

    /**
     * @description Removes the Entity identified by the symbol from the storage
     * @param symbol Unique identifier to manage the Entity
     */
    remove(symbol: symbol): Promise<void> | void;

    /**
     * @description Compute the Entity prototype to an actual Entity, save it to the storage and return it 
     * @param symbol Unique identifier to manage the Entity
     * @returns T
     */
    save(symbol: symbol): Promise<Readonly<T>> | Readonly<T>;
}