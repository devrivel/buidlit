import { Schema, model } from 'mongoose'
import { IMerchant } from '../interfaces/IMerchant'

const MerchantSchema = new Schema<IMerchant>({
	name: { 
		type: String, 
		required: true
	},
	email: String,
	createdBy: { 
		type: Schema.Types.ObjectId, 
		ref: 'User'
	},
	admins: [{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		role: {
			type: String,
			enum: ['owner', 'admin', 'developer', 'analyst', 'support']
		}
	}],
	paymentAddresses: [{
		chainId: {
			type: String,
			required: true,
			trim: true
		},
		address: {
			type: String,
			required: true,
			lowercase: true,
			trim: true
		}
	}]
}, { timestamps: true })

MerchantSchema.index({ admins: 1 })

const Merchant = model<IMerchant>('Merchant', MerchantSchema)
export default Merchant