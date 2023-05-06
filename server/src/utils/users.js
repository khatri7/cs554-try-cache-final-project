import bcrypt from 'bcrypt';
import moment from 'moment';
import {
	badRequestErr,
	internalServerErr,
	isLetterChar,
	isNumberChar,
	isValidObj,
	isValidObjectId,
	isValidStr,
} from '.';

const SALT_ROUNDS = 16;
const USER_ROLES = ['tenant', 'lessor'];

// Taken from HTML spec: https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
const rEmail =
	// eslint-disable-next-line no-useless-escape
	/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const rPhone = /^\d{10}$/;

/**
 *
 * @param {string} emailParam
 * @returns {string} email after trimming and converting to lower case if it is a valid email otherwise throws an error
 */
export const isValidEmail = (emailParam) => {
	const email = isValidStr(emailParam, 'Email');
	if (!rEmail.test(email)) throw badRequestErr('Invalid Email');
	return email.toLowerCase();
};

/**
 *
 * @param {string} password
 * @returns {Promise<string>} hash of the password
 */
export const hashPassword = async (password) => {
	try {
		const hash = await bcrypt.hash(password, SALT_ROUNDS);
		return hash;
	} catch (e) {
		throw internalServerErr('Error hashing password. Please try again');
	}
};

/**
 *
 * @param {string} password plain text password to compare
 * @param {string} hash hash of the password from DB
 * @returns {Promise<boolean>} result of the comparision or throws an error
 */
export const comparePassword = async (password, hash) => {
	try {
		const isSame = await bcrypt.compare(password, hash);
		return isSame;
	} catch (e) {
		throw internalServerErr('Error checking password. Please try again');
	}
};

/**
 *
 * @param {string} passwordParam
 * @returns {string} password if it is a valid password otherwise throws an error
 */
const isValidPassword = (passwordParam) => {
	if (passwordParam.split('').includes(' '))
		throw badRequestErr('Passwords cannot contain spaces');
	const password = isValidStr(passwordParam, 'Password', 'min', 8);
	return password;
};

/**
 *
 * @param {string} roleParam
 * @returns {string} role trimmed if it is valid otherwise throws an error
 */
export const isValidUserRole = (roleParam) => {
	const role = isValidStr(roleParam, 'role')?.toLowerCase();
	if (!USER_ROLES.includes(role)) throw badRequestErr('Invalid user role');
	return role;
};

/**
 *
 * @param {string} dateParam
 * @param {string} varName
 * @returns {import('moment').Moment} moment date object is the date is valid
 */
export const isValidDateStr = (dateParam, varName) => {
	const date = isValidStr(dateParam, varName);
	date.split('').forEach((char) => {
		if (!isNumberChar(char) && char !== '-')
			throw badRequestErr(`Invalid ${varName}`);
	});
	const [month, day, year] = date.split('-');
	if (month.length !== 2 || day.length !== 2 || year.length !== 4)
		throw badRequestErr(`Invalid ${varName}`);
	const yearInt = parseInt(year.trim(), 10);
	const monthInt = parseInt(month.trim(), 10);
	const dayInt = parseInt(day.trim(), 10);
	if (
		!Number.isFinite(yearInt) ||
		!Number.isFinite(monthInt) ||
		!Number.isFinite(dayInt)
	)
		throw badRequestErr(`Invalid ${varName}`);
	const momentDate = moment(
		`${yearInt.toString().padStart(4, '0')}-${monthInt
			.toString()
			.padStart(2, '0')}-${dayInt.toString().padStart(2, '0')}`
	);
	if (!momentDate.isValid()) throw badRequestErr(`Invalid ${varName}`);
	return momentDate;
};

/**
 *
 * @param {string} dateParam in format MM-DD-YYYY
 * @returns {string} date string if it is valid otherwise throws an error
 */
const isValidDob = (dateParam) => {
	const momentDate = isValidDateStr(dateParam, 'DOB');
	if (!momentDate.isValid()) throw badRequestErr('Invalid DOB');
	const difference = moment().diff(momentDate, 'year');
	if (difference < 16 || difference > 100)
		throw badRequestErr('Invalid DOB: should be between 12-100 years in age');
	return momentDate.format('MM-DD-YYYY');
};

/**
 *
 * @param {string} nameParam
 * @param {string} varName
 * @param {boolean} allowPunctuations
 * @returns {string} name after trimming if it is a valid director name otherwise throws an error
 */
const isValidName = (nameParam, varName, allowPunctuations = false) => {
	const name = isValidStr(nameParam, varName, 'min', 3);
	isValidStr(name, varName, 'max', 40);
	name
		.toLowerCase()
		.split('')
		.forEach((char) => {
			if (
				!isLetterChar(char) &&
				!(allowPunctuations && ["'", '.', '-'].includes(char))
			)
				throw badRequestErr(
					`The ${varName} should not consist of numbers or any special characters`
				);
		});
	return name;
};

const isValidPhone = (phoneParam) => {
	const phone = isValidStr(phoneParam, 'phone');
	if (!rPhone.test(phone)) throw badRequestErr('Invalid Phone');
	return phone;
};

/**
 *
 * @param {object} userObjParam
 * @returns {object} user object after validating each field
 */
export const isValidUserObj = (userObjParam) => {
	isValidObj(userObjParam);
	return {
		firstName: isValidName(userObjParam.firstName, 'First Name', false),
		lastName: isValidName(userObjParam.lastName, 'Last Name', false),
		dob: isValidDob(userObjParam.dob),
		role: isValidUserRole(userObjParam.role),
		email: isValidEmail(userObjParam.email),
		phone: isValidPhone(userObjParam.phone),
		password: isValidPassword(userObjParam.password),
	};
};

export const isValidUserLoginObj = (userLoginObjParam) => {
	isValidObj(userLoginObjParam);
	return {
		email: isValidEmail(userLoginObjParam.email),
		password: isValidPassword(userLoginObjParam.password),
	};
};

export const isValidUserAuthObj = (userAuthObjParam) => ({
	_id: isValidObjectId(userAuthObjParam._id),
	email: isValidEmail(userAuthObjParam.email),
	role: isValidUserRole(userAuthObjParam.role),
});
