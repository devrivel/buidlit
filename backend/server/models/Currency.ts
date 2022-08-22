import { Schema, model, Model } from 'mongoose'
import { ICurrency } from '../interfaces/ICurrency'

interface CurrencyModel extends Model<ICurrency> {
	findOneWithCache(filter:any): any;
}

const CurrencySchema = new Schema<ICurrency, CurrencyModel>({
	name: {
		type: String,
		required: true
	},
	symbol: {
		type: String,
		required: true,
		index: true
	},
	icon: String,
	address: {
		type: String,
		required: true,
		lowercase: true,
		trim: true,
		index: true
	},
	decimals: {
		type: Number,
		default: 18
	},
	chainId: {
		type: String,
		required: true,
		trim: true,
		index: true
	},
	priceId: String
}, { timestamps: true })

CurrencySchema.statics.findOneWithCache = function (filter) {
	// TODO: Implement cache
	return this.findOne(filter)
}

const Currency = model<ICurrency, CurrencyModel>('Currency', CurrencySchema)
export default Currency