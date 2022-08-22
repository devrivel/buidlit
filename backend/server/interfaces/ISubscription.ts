import { Types } from 'mongoose'

export interface ISubscription {
	subscriber: string;
	chainId: string;
	contractId?: string;
	product: Types.ObjectId;
	merchant: Types.ObjectId;
	userCurrency: string;
	productCurrency: string;
	price: number;
	lastPaymentAt?: Date;
	nextPaymentAt: Date;
	endDate?: Date;
	trialStart?: Date;
	trialEnd?: Date;
	canceledAt?: Date;
	status: string;
}