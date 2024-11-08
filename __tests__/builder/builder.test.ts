import { describe } from "@jest/globals";
import { Builder } from "../../src/Builder";

describe("Builder", () => {
    // Arrange for ALL tests
    class Test {
        id?: number;
        ok?: boolean;
        timeout_in_seconds: number;

        constructor() {
            this.timeout_in_seconds = 5;
        }
    }

    test("Should create a builder when initialized with a class", () => {
        // Act
        const builder = new Builder<Test, 'id'>(Test);

        // Assert
        expect(builder).toBeDefined();
        expect(builder).toHaveProperty('set');
        expect(builder).toHaveProperty('compute');
        expect(builder).not.toHaveProperty('ok');
        expect(builder).not.toHaveProperty('timeout_in_seconds');
    })

    test("Should be able to compute to an instance of a class using default values", () => {
        // Arrange
        const builder = new Builder<Test, 'id'>(Test);

        //Act
        const result = builder.compute()

        // Assert
        expect(result).toBeDefined();
        expect(result).toHaveProperty('timeout_in_seconds');
        expect(result).toHaveProperty('ok');
        expect(result.timeout_in_seconds).toStrictEqual(5);
        expect(result.ok).toBeUndefined();
        expect(result).toHaveProperty('id');
        expect(result).not.toHaveProperty('set');
        expect(result).not.toHaveProperty('compute');
    })

    test("Should be able to set values in entity, except for PrimaryKey", () => {
        // Arrange
        const builder = new Builder<Test, 'id'>(Test);

        //Act
        builder.set('ok', true).set('timeout_in_seconds', 10)
        const result = builder.compute()


        // Assert
        expect(result).toBeDefined();
        expect(result).toHaveProperty('timeout_in_seconds');
        expect(result).toHaveProperty('ok');
        expect(result).toHaveProperty('id');
        expect(result.timeout_in_seconds).toStrictEqual(10);
        expect(result.ok).toStrictEqual(true);
        expect(Reflect.get(result, 'id')).toBeUndefined();
        expect(result).not.toHaveProperty('set');
        expect(result).not.toHaveProperty('compute');
    })
});