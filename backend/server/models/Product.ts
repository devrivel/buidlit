import { Schema, model } from 'mongoose'
import { nanoid } from 'nanoid'
import { IProduct } from '../interfaces/IProduct'

const ProductSchema = new Schema<IProduct>({
	merchant: {
		type: Schema.Types.ObjectId,
		index: true,
		required: true,
		ref: 'Merchant'
	},
	name: {
		type: String,
		required: true,
		trim: true
	},
	description: {
		type: String
	},
	checkoutId: {
		type: String,
		index: true,
		unique: true,
		default: () => {
			return nanoid(8)
		}
	},
	images: {
		type: [String],
		default: []
	},
	active: {
		type: Boolean,
		default: true
	},
	price: {
		type: Number,
		required: true
	},
	currency: {
		type: {
			type: String,
			enum: ['fiat', 'crypto'],
			default: 'crypto'
		},
		detail: {
			type: String,
			default: 'USDC'
		}
	},
	recurring: {
		interval: {
			type: Number
		},
		intervalCount: {
			type: Number,
			default: 0
		},
		trialPeriod: {
			type: Number,
			default: 0
		}
	},
	metadata: Schema.Types.Mixed
})

const Product = model<IProduct>('Product', ProductSchema)
export default Product