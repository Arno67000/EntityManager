import { describe } from '@jest/globals';
import { Builder } from '../../src/Builder';
import MockUser from '../__mocks__/user.mock';

describe('Builder', () => {
	test('Should create a builder when initialized with a class', () => {
		// Act
		const builder = new Builder<MockUser, 'name'>(MockUser);

		// Assert
		expect(builder).toBeDefined();
		expect(builder).toHaveProperty('set');
		expect(builder).toHaveProperty('compute');
		expect(builder).not.toHaveProperty('age');
		expect(builder).not.toHaveProperty('status');
	});

	test('Should be able to compute to an instance of a class using default values', () => {
		// Arrange
		const builder = new Builder<MockUser, 'name'>(MockUser);

		//Act
		const result = builder.compute();

		// Assert
		expect(result).toBeDefined();
		expect(result).toHaveProperty('age');
		expect(result).toHaveProperty('status');
		expect(result.status).toStrictEqual('active');
		expect(result.age).toBeUndefined();
		expect(result).toHaveProperty('name');
		expect(result).not.toHaveProperty('set');
		expect(result).not.toHaveProperty('compute');
	});

	test('Should be able to set values in entity, except for PrimaryKey', () => {
		// Arrange
		const builder = new Builder<MockUser, 'name'>(MockUser);

		//Act
		builder.set('age', 33).set('status', 'inactive');
		const result = builder.compute();

		// Assert
		expect(result).toBeDefined();
		expect(result).toHaveProperty('status');
		expect(result).toHaveProperty('age');
		expect(result).toHaveProperty('name');
		expect(result.status).toStrictEqual('inactive');
		expect(result.age).toStrictEqual(33);
		expect(Reflect.get(result, 'name')).toBeUndefined();
		expect(result).not.toHaveProperty('set');
		expect(result).not.toHaveProperty('compute');
	});
});
