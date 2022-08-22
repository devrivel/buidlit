import { Schema, model } from 'mongoose'
import { ISubscription } from '../interfaces/ISubscription'

const SubscriptionSchema = new Schema<ISubscription>({
	subscriber: {
		type: String,
		lowercase: true,
		trim: true,
		required: true
	},
	chainId: {
		type: String,
		trim: true,
		required: true
	},
	contractId: {
		type: String
	},
	merchant: {
		type: Schema.Types.ObjectId,
		ref: 'Merchant',
		index: true,
		required: true
	},
	product: {
		type: Schema.Types.ObjectId,
		ref: 'Product',
		required: true,
		index: true
	},
	userCurrency: { // User's chosen payment token
		type: String,
		lowercase: true,
		trim: true,
		required: true
	},
	productCurrency: {
		type: String,
		lowercase: true,
		trim: true,
		required: true
	},
	price: { // Product price at time of purchase
		type: Number,
		required: true
	},
	status: {
		type: String,
		required: true,
		index: true,
		default: 'active'
	},
	lastPaymentAt: {
		type: Date
	},
	nextPaymentAt: {
		type: Date,
		index: true
	},
	endDate: {
		type: Date,
	},
	trialStart: Date,
	trialEnd: Date,
	canceledAt: Date
}, { timestamps: true })

const Subscription = model<ISubscription>('Subscription', SubscriptionSchema)
export default Subscription