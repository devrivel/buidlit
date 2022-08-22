import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import Web3 from 'web3'

import User from '../../models/User'
import Login from '../../models/Login'
import { logger } from '../../utils/Logger'

import { extractUser } from '../../middleware/AuthMiddleware'

const router = Router()
const web3 = new Web3('https://polygon-rpc.com')

router.post('/web3/token', async (req, res) => {
	const { signature } = req.body
	if (!signature) return res.status(400).json({ code: 400, message: 'Signature required.' })

	try {
		const address = web3.eth.accounts.recover('Login to Rivel', signature)
		
		const user = await User.findOneAndUpdate({ address }, { 
			loginProvider: 'web3'
		}, { new: true, upsert: true })

		await Login.create({ user: user._id })

		const token: string = jwt.sign({ user, method: 'web3' }, process.env.TOKEN_SECRET || '', { expiresIn: '1d' })
		return res.status(200).cookie('auth_token', token, { maxAge: 86400000, httpOnly: true }).json({ token })
	} catch (error:any) {
		logger.error(error.message)
		return res.status(500).json({ code: 500, message: 'Something went wrong.' })
	}
})

router.get('/user', [extractUser], (req:Request, res:Response) => {
	return res.status(200).send(req.user)
})

export default router