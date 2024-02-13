import { NextApiRequest, NextApiResponse } from 'next'

import { calculatePatrimony } from '../../core/patrimony'
import { toCommonDenominator } from '../../core/commonDenominator'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method not allowed' })
  }

  if (req.headers['content-type'] !== 'application/json') {
    return res.status(400).send({ error: 'Content type not allowed' })
  }

  try {
    const result = calculatePatrimony(req.body)

    if (req.query['denominatorecomune'] === 'true') {
      toCommonDenominator(result)
    }

    return res.json(result)
  } catch (error) {
    return res.status(500).send({ error: 'Failed to parse body' })
  }
}
