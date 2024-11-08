import { EntityBuilder, EntityProto, PrimaryKey } from "./types";

export class Builder<T, K extends PrimaryKey<T>> implements EntityBuilder<T, K> {

    #proto: EntityProto<T, K>;


    constructor(ctor: new () => EntityProto<T, K>) {
        this.#proto = new ctor();
    }

    /**
     * @description Set values in the EntityProto and return EntityBuilder
     * @param key The key to target in the EntityProto (type-safe)
     * @param value The value to assign to the key (type-safe)
     * @returns EntityBuilder
     */
    set<Y extends keyof EntityProto<T, K>>(key: Y, value: EntityProto<T, K>[Y]) {
        this.#proto[key] = value;
        return this;
    }

    /**
     * @description Build and return the EntityProto
     */
    compute() {
        return this.#proto;
    }
}
