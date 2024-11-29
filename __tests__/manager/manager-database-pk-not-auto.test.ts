import { afterEach, beforeEach, describe } from '@jest/globals';
import { Builder } from '../../src/Builder';
import { Manager } from '../../src/Manager';
import type { DatabaseTableInfo } from '../../src/types';
import { InMemoryDatabaseManual } from '../__mocks__/memory-db-connector-pk-not-auto.mock';
import MockUser from '../__mocks__/user.mock';

describe('Manager #with_database_pk_auto_generated', () => {
	// Arrange for all tests
	const dbConfig: DatabaseTableInfo<MockUser, 'name'> = {
		connector: new InMemoryDatabaseManual<MockUser, 'name'>(),
		table_name: 'users',
		primary_key: 'name',
		PK_auto_generated: false,
	};

	test('should create a manager with DatabaseTableInfo setup', () => {
		// Act
		const manager = new Manager<MockUser, 'name'>(dbConfig);

		// Assert
		expect(manager).toBeDefined();
		expect(manager.clean).toBeDefined();
		expect(manager.create).toBeDefined();
		expect(manager.get).toBeDefined();
		expect(manager.remove).toBeDefined();
		expect(manager.save).toBeDefined();
	});

	describe('create', () => {
		// Arrange
		const manager = new Manager<MockUser, 'name'>(dbConfig);

		afterEach(async () => await manager.clean());

		test('should return an entity builder', () => {
			// Act
			const builder = manager.create(Symbol('user-test'), MockUser);

			// Assert
			expect(builder).toBeInstanceOf(Builder);
		});
	});

	describe('save', () => {
		// Arrange
		const manager = new Manager<MockUser, 'name'>(dbConfig);

		beforeEach(async () => await manager.connect());
		afterEach(async () => await manager.clean());

		test('should return a complete entity', async () => {
			// Arrange
			const symUser = Symbol('user-test');
			manager.create(symUser, MockUser).set('age', 33);

			// Act
			const user = await manager.save(symUser, ['name', 'John']);

			// Assert
			expect(user.status).toStrictEqual('active');
			expect(user.name).toStrictEqual('John');
			expect(user.age).toStrictEqual(33);
		});

		test('should throw Error if trying to save without primary_key set in save parameters', async () => {
			// Arrange
			const symUser = Symbol('user-test');
			manager.create(symUser, MockUser).set('age', 33);

			// Assert
			await expect(manager.save(symUser)).rejects.toThrow('Fatal Error: Missing Primary Key');
		});
	});

	describe('get', () => {
		// Arrange
		const manager = new Manager<MockUser, 'name'>(dbConfig);

		beforeEach(async () => await manager.connect());
		afterEach(async () => await manager.clean());

		test('should get the stored entity from DatabaseTableInfo', async () => {
			// Arrange
			const symUser1 = Symbol('user-test-1');
			manager.create(symUser1, MockUser).set('age', 33);
			await manager.save(symUser1, ['name', 'John']);

			// Act
			const user = await manager.get(symUser1);

			// Assert
			expect(user).toStrictEqual({
				name: 'John',
				age: 33,
				status: 'active',
			});
		});

		test('should throw Error if entity is not initialized in repo', async () => {
			// Arrange
			const symUser1 = Symbol('user-test-1');

			// Assert
			await expect(manager.get(symUser1)).rejects.toThrow(`Missing entity for symbol: ${String(symUser1)}`);
		});
	});

	describe('remove', () => {
		// Arrange
		const manager = new Manager<MockUser, 'name'>(dbConfig);
		const symUser1 = Symbol('user-test-1');

		beforeEach(async () => {
			await manager.connect();
			manager.create(symUser1, MockUser).set('age', 33);
			await manager.save(symUser1, ['name', 'John']);
		});

		afterEach(async () => await manager.clean());

		test('should remove the stored entity from DatabaseTableInfo & return true', async () => {
			// Act
			const deleted = await manager.remove(symUser1);

			// Assert
			expect(deleted).toBeTruthy();
		});

		test('should throw Error if user is not in store', async () => {
			// Arrange
			const symUser2 = Symbol('user-test-2');

			// Assert
			await expect(manager.remove(symUser2)).rejects.toThrow(`Missing entity for symbol: ${String(symUser2)}`);
		});
	});

	describe('clean', () => {
		// Arrange for all
		const manager = new Manager<MockUser, 'name'>(dbConfig);

		beforeEach(async () => await manager.connect());
		afterEach(async () => await manager.clean());

		test('should remove every entity from DatabaseTableInfo', async () => {
			// Arrange
			const symUser1 = Symbol('user-test-1');
			manager.create(symUser1, MockUser).set('age', 33);
			await manager.save(symUser1, ['name', 'John']);

			// Act
			await manager.clean();

			// Assert
			await expect(manager.get(symUser1)).rejects.toThrow(`Missing entity for symbol: ${String(symUser1)}`);
		});
	});
});
