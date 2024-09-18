type PrimaryKey = 'id' | 'uid';

export type EntityProto<T extends { [P in PrimaryKey]: string | number }> = Omit<T, PrimaryKey>;

export type EntityBuilder<T extends { [P in PrimaryKey]: string | number }, E = EntityProto<T>> = {
    set<K extends keyof E>(key: K, value: E[K]): EntityBuilder<T>;
    compute(): E
}

export type EntityManager<T extends { [P in PrimaryKey]: string | number }> = {
    create(symbol: symbol, constructor: new () => EntityProto<T>): EntityBuilder<T>;
    clean(): Promise<void> | void;
    remove(symbol: symbol): Promise<void> | void;
    save(symbol: symbol): Promise<Readonly<T>> | Readonly<T>;
}