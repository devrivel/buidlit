import { Schema, model } from 'mongoose'
import { IUser } from '../interfaces/IUser'

const userSchema = new Schema<IUser>({
	address: { 
		type: String,
		lowercase: true,
		trim: true,
		unique: true,
		index: true
	},
	email: {
		type: String,
		index: true
	},
	password: String,
	role: {
		type: String,
		enum: ['client', 'developer', 'admin'],
		default: 'client'
	},
	loginProvider: {
		type: String,
		default: 'web3'
	}
}, { timestamps: true })

const User = model<IUser>('User', userSchema)
export default User