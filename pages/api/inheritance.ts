import { NextApiRequest, NextApiResponse } from 'next'
import { calculateInheritance } from '../../utils/inheritance'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send({ error: 'Method not allowed' })
  if (req.headers['content-type'] !== 'application/json')
    return res.status(400).send({ error: 'Content type not allowed' })

  try {
    const result = calculateInheritance(req.body)
    return res.json(result)
  } catch (error) {
    return res.status(500).send({ error: 'Failed to parse body' })
  }
}
