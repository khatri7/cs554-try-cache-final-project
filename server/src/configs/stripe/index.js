import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';

let stripe;

const getEnvVariables = () => {
	return new Promise((resolve) => {
		if (process.env.STRIPE_SK) {
			resolve(true);
		} else {
			const checkInterval = setInterval(() => {
				if (process.env.STRIPE_SK) {
					clearInterval(checkInterval);
					resolve(true);
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
	userId,
	firstName,
	lastName,
	email,
	phone,
	applicationId,
	successUrl,
	cancelUrl
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
			metadata: {
				user_id: userId,
				application_id: applicationId,
			},
			success_url: `http://localhost:${
				process.env.SERVER_PORT || 4000
			}/applications/${applicationId}/payment/success?session_id={CHECKOUT_SESSION_ID}${
				successUrl ? `&successUrl=${successUrl}` : ''
			}`,
			cancel_url: `http://localhost:${
				process.env.SERVER_PORT || 4000
			}/applications/${applicationId}/payment/cancel?session_id={CHECKOUT_SESSION_ID}${
				cancelUrl ? `&cancelUrl=${cancelUrl}` : ''
			}`,
		},
		{ idempotencyKey }
	);
};

export const getCheckoutSession = async (sessionId) =>
	stripe.checkout.sessions.retrieve(sessionId);
