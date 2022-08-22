import Agenda from 'agenda'
import { sendMessage } from './SQS'
import Subscription from '../models/Subscription'
import config from '../config'

const agenda = new Agenda({ db: { address: config.mongoConnection }})

agenda.define('getDueSubscriptions', async () => {
	// const subscriptions = await Subscription.find({ nextPaymentAt: { $lt: new Date() }})
	// subscriptions.forEach((sub) => {
	// 	const jsonString = JSON.stringify(sub.toJSON())
	// 	sendMessage(jsonString)
	// })
})

export async function initAgenda () {
	await agenda.start()
	await agenda.now('getDueSubscriptions', null)
}