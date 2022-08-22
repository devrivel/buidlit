import { Schema, model } from 'mongoose'
import { IApiKey } from '../interfaces/IApiKey'
import { v4 as uuid } from 'uuid'

const ApiKeySchema = new Schema<IApiKey>({
	type: { 
		type: String, 
		enum: ['live', 'test'],
		default: 'live',
		index: true
	},
	key: {
		type: String,
		index: true,
		trim: true,
		default: uuid()
	},
	merchant: {
		type: Schema.Types.ObjectId,
		index: true,
		required: true,
		ref: 'Merchant'
	},
	expiresAt: {
		type: Date,
		default: () => {
			// Expiry 3 years from now
			const date = new Date()
			date.setFullYear(date.getFullYear() + 3)
			return date
		}
	},
	active: {
		type: Boolean,
		default: true
	},
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	}
}, { timestamps: true })

const ApiKey = model<IApiKey>('ApiKey', ApiKeySchema)
export default ApiKey