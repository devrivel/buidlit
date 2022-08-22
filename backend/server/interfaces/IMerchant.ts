
import { Types } from 'mongoose'

interface IAdminRole {
  user: Types.ObjectId;
  role: string;
}

interface IPaymentAddress {
  chainId: string;
  address: string;
}

export interface IMerchant {
  name: string;
  email?: string;
  admins: Array<IAdminRole>;
  paymentAddresses: Array<IPaymentAddress>;
  createdBy: Types.ObjectId;
}