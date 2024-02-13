import { NextApiRequest, NextApiResponse } from 'next'

import { calculateInheritance } from '../../core/inheritance'
import { toCommonDenominator } from '../../core/commonDenominator'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method not allowed' })
  }

  if (req.headers['content-type'] !== 'application/json') {
    return res.status(400).send({ error: 'Content type not allowed' })
  }

  // TODO: Don't require sender to set back pointers for people, only the relatives array

  try {
    const result = calculateInheritance(req.body)

    if (req.query['denominatorecomune'] === 'true') {
      toCommonDenominator(result)
    }

    return res.json(result)
  } catch (error) {
    return res.status(500).send({ error: 'Failed to parse body' })
  }
}
