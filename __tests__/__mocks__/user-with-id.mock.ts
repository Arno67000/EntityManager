import type { EntityProto } from '../../src/types';

export interface User {
	id: string;
	name?: string;
	age?: number;
	status: string;
}

export default class MockUserWithId implements EntityProto<User, 'id'> {
	name?: string;
	age?: number;
	status: string;

	constructor() {
		this.status = 'active';
	}
}
