import  { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'
import { logger } from '../utils/Logger'
const sqs = new SQSClient({ region: 'us-east-1' })

export async function sendMessage (body:string) {
	try {
		const params = {
			QueueUrl: process.env.SQS_QUEUE_URL,
			MessageBody: body
		}

		const data = await sqs.send(new SendMessageCommand(params))
		logger.info('Subscription sent to queue. MessageID: ', data.MessageId)

		return Promise.resolve(data)
	} catch (error:any) {
		logger.error(error)
		return Promise.reject(error.message)
	}
}

export { sqs as sqsClient }
