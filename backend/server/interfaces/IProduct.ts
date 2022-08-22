import { Types } from 'mongoose'
import { IMerchant } from './IMerchant'

interface Recurring {
	interval: string;
	intervalCount: number;
	trialPeriod: number;
}

interface CurrencyType {
	type: string;
	detail: string;
}

export interface IProduct {
	merchant: IMerchant;
	name: string;
	description?: string;
	images: Array<string>;
	active: boolean;
	price: number;
	recurring?: Recurring;
	metadata?: object;
	currency: CurrencyType;
	checkoutId?: string;
}