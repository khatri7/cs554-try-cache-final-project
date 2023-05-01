import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';

let stripe;

const getEnvVariables = () => {
	return new Promise((resolve) => {
		if (process.env.STRIPE_SK) {
			resolve();
		} else {
			const checkInterval = setInterval(() => {
				if (process.env.STRIPE_SK) {
					clearInterval(checkInterval);
					resolve();
				}
			}, 100);
		}
	});
};

const initStripeInstance = () => {
	stripe = new Stripe(process.env.STRIPE_SK, {
		apiVersion: '2022-11-15',
	});
};

getEnvVariables().then(() => {
	initStripeInstance();
});

export const getOrCreateCustomer = async (name, email, phone) => {
	const customers = await stripe.customers.list({ email });
	if (customers.data.length > 0) return customers.data[0];

	const customer = await stripe.customers.create({
		email,
		name,
		phone,
	});

	return customer;
};

export const createCheckoutSession = async (
	firstName,
	lastName,
	email,
	phone
) => {
	const idempotencyKey = uuidv4();
	const customer = await getOrCreateCustomer(
		`${firstName} ${lastName}`,
		email,
		phone
	);
	return stripe.checkout.sessions.create(
		{
			payment_method_types: ['card'],
			customer: customer.id,
			line_items: [
				{
					price: 'price_1N2ivWD7GYTZgDcdG3oToKqE',
					quantity: 1,
				},
			],
			mode: 'payment',
			success_url:
				'http://localhost:4000/applications/payment/success?session_id={CHECKOUT_SESSION_ID}',
			cancel_url: 'http://localhost:3000/cancel',
		},
		{ idempotencyKey }
	);
};

export const getCheckoutSession = async (sessionId) =>
	stripe.checkout.sessions.retrieve(sessionId);
