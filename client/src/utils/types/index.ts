export interface User {
	_id: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	role: 'tenant' | 'lessor';
}

export interface UserCreate {
	phone: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	dob: null;
	role: string;
}
