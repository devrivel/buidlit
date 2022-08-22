import { Schema, model } from 'mongoose'
import { IChain } from '../interfaces/IChain'

const ChainSchema = new Schema<IChain>({
	chainId: { 
		type: String, 
		index: true,
		required: true,
		unique: true
	},
	name: { 
		type: String, 
		required: true
	},
	rpc: { 
		type: [String], 
		default: []
	},
	testnet: {
		type: Boolean,
		default: false
	},
	slug: String,
	icon: String
}, { timestamps: true })

const Chain = model<IChain>('Chain', ChainSchema)
export default Chain