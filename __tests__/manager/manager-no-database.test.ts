import { afterEach, describe } from '@jest/globals';
import { Builder } from '../../src/Builder';
import { Manager } from '../../src/Manager';
import type { LocalStoreInfo } from '../../src/types';
import MockUser from '../__mocks__/user.mock';

describe('Manager #without_database', () => {
	// Arrange for all tests
	const localStoreConfig: LocalStoreInfo<MockUser, 'name'> = { primary_key: 'name' };

	test('should create a manager with localStore setup', () => {
		// Act
		const manager = new Manager<MockUser, 'name'>(localStoreConfig);

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
		const manager = new Manager<MockUser, 'name'>(localStoreConfig);

		afterEach(async () => await manager.clean());

		test('should return an entity builder', () => {
			// Act
			const builder = manager.create(Symbol('user-test'), MockUser);

			// Assert
			expect(builder).toBeInstanceOf(Builder);
		});
	});

	describe('save with primary_key', () => {
		// Arrange
		const manager = new Manager<MockUser, 'name'>(localStoreConfig);

		afterEach(async () => await manager.clean());

		test('should return a complete entity', async () => {
			// Arrange
			const symUser = Symbol('user-test');
			manager.create(symUser, MockUser).set('age', 33).set('status', 'active');

			// Act
			const user = await manager.save(symUser, ['name', 'John']);

			// Assert
			expect(user.status).toStrictEqual('active');
			expect(user.name).toStrictEqual('John');
			expect(user.age).toStrictEqual(33);
		});

		test('should throw Error if missing primary_key', async () => {
			// Arrange
			const symUser = Symbol('user-test');
			manager.create(symUser, MockUser).set('age', 33).set('status', 'active');

			// Act
			const user = manager.save(symUser);

			// Assert
			await expect(user).rejects.toThrow('Fatal Error: Missing Primary Key');
		});

		test('should throw Error if duplicate primary_key', async () => {
			// Arrange
			const symUser1 = Symbol('user-test-1');
			manager.create(symUser1, MockUser).set('age', 33).set('status', 'active');
			await manager.save(symUser1, ['name', 'John']);

			const symUser2 = Symbol('user-test-2');
			manager.create(symUser2, MockUser).set('age', 55).set('status', 'inactive');

			// Act
			const user = manager.save(symUser2, ['name', 'John']);

			// Assert
			await expect(user).rejects.toThrow('Primary key constraint error: value [John] already exists');
		});
	});

	describe('save without primary key constraint', () => {
		// Arrange
		const manager = new Manager<MockUser>({});
		const symUser = Symbol('user-test');

		afterEach(async () => await manager.clean());

		test('should return entity without error if no primary_key set from config', async () => {
			// Arrange
			manager.create(symUser, MockUser).set('age', 33).set('status', 'active').set('name', 'John');

			// Act
			const user = await manager.save(symUser);

			// Assert
			expect(user.status).toStrictEqual('active');
			expect(user.name).toStrictEqual('John');
			expect(user.age).toStrictEqual(33);
		});
	});

	describe('get', () => {
		// Arrange
		const manager = new Manager<MockUser, 'name'>(localStoreConfig);

		afterEach(async () => await manager.clean());

		test('should get the stored entity from localStore', async () => {
			// Arrange
			const symUser1 = Symbol('user-test-1');
			manager.create(symUser1, MockUser).set('age', 33).set('status', 'active');
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

		test('should return undefined if user is not in the localStore', async () => {
			// Arrange
			const symUser1 = Symbol('user-test-1');
			manager.create(symUser1, MockUser).set('age', 33).set('status', 'active');

			// Act
			const user = await manager.get(symUser1);

			// Assert
			expect(user).toBeUndefined();
		});
	});

	describe('remove', () => {
		// Arrange
		const manager = new Manager<MockUser, 'name'>(localStoreConfig);
		const symUser1 = Symbol('user-test-1');

		beforeEach(async () => {
			manager.create(symUser1, MockUser).set('age', 33).set('status', 'active');
			await manager.save(symUser1, ['name', 'John']);
		});

		afterEach(async () => await manager.clean());

		test('should remove the stored entity from localStore & return true', async () => {
			// Act
			const deleted = await manager.remove(symUser1);

			// Assert
			expect(deleted).toBeTruthy();
			await expect(manager.get(symUser1)).resolves.toBeUndefined();
		});

		test('should return false if user is not in store', async () => {
			// Arrange
			const symUser2 = Symbol('user-test-2');

			// Act
			const deleted = await manager.remove(symUser2);

			// Assert
			expect(deleted).toBeFalsy();
		});
	});

	describe('clean', () => {
		test('should remove every entity from localStore', async () => {
			// Arrange
			const manager = new Manager<MockUser, 'name'>(localStoreConfig);
			const symUser1 = Symbol('user-test-1');
			manager.create(symUser1, MockUser).set('age', 33).set('status', 'active');
			await manager.save(symUser1, ['name', 'John']);

			// Act
			await manager.clean();
			const user = await manager.get(symUser1);

			// Assert
			expect(user).toBeUndefined();
		});
	});
});
