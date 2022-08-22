import { Types } from 'mongoose'

export interface ILogin {
	timestamp: Date;
  user: Types.ObjectId;
}
