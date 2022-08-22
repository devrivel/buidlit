import jwt from 'jsonwebtoken'

export default function handler(req, res) {
  const { signature } = req.body
  const token = jwt.sign({ signature, method: 'web3' }, process.env.TOKEN_SECRET, { expiresIn: '1d' })

  res.status(200).json({ token })
}