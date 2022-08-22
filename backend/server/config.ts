declare module 'express' {
	interface Request {
		user?: any,
		apiKeyValid?: boolean;
	}
}

const { MONGO_USER, MONGO_PASS, MONGO_URL, MONGO_DEFAULT_DB } = process.env

const config: any = {
	PORT: process.env.PORT || 8000,
	mongoConnection: `mongodb+srv://${MONGO_USER}:${MONGO_PASS}@${MONGO_URL}/${MONGO_DEFAULT_DB}?retryWrites=true&w=majority`,
	subscriptionContracts: {
		'137': '0xe6B55761029150921E72Dd16C5d4E328146701fD'
	}
}

export default config