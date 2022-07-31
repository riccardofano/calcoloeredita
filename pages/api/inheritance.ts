import { NextApiRequest, NextApiResponse } from 'next'
import { calculateInheritance } from '../../utils/inheritance'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405)
  if (req.headers['content-type'] !== 'application/json') return res.status(400)

  let result = calculateInheritance(req.body)
  return res.json(result)
}
