import { Schema, model } from 'mongoose'
import { ILogin } from '../interfaces/ILogin'

const loginSchema = new Schema<ILogin>({
	timestamp: {
		type: Date,
		default: new Date()
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		index: true,
		required: true
	}
})

const Login = model<ILogin>('Login', loginSchema)
export default Login