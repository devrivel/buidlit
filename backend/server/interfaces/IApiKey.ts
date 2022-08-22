import { Types } from 'mongoose'

export interface IApiKey {
  type: string;
  key: string;
  merchant: Types.ObjectId;
  expiresAt: Date;
  active: boolean;
  createdBy: Types.ObjectId;
}