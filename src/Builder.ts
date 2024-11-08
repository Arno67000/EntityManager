import { EntityBuilder, EntityProto } from "./types";

export class Builder<T> implements EntityBuilder<T> {

    #proto: EntityProto<T>;


    constructor(ctor: new () => EntityProto<T>) {
        this.#proto = new ctor();
    }

    /**
     * @description Set values in the EntityProto and return EntityBuilder
     * @param key The key to target in the EntityProto (type-safe)
     * @param value The value to assign to the key (type-safe)
     * @returns EntityBuilder
     */
    set<K extends keyof EntityProto<T>>(key: K, value: EntityProto<T>[K]) {
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
