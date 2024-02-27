import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

import { calculateInheritance } from '../../core/inheritance'
import { toCommonDenominator } from '../../core/commonDenominator'
import { categoryNames } from '../../core/types/Category'

const People = z.record(
  z.string().min(1),
  z.object({
    id: z.string(),
    name: z.string(),
    available: z.boolean(),
    degree: z.number().optional(),
    previous: z.string().nullable(),
    category: z.enum(categoryNames),
    relatives: z.array(z.string()),
  })
)

export function validate(body: unknown) {
  People.parse(body)
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method not allowed' })
  }

  if (req.headers['content-type'] !== 'application/json') {
    return res.status(400).send({ error: 'Content type not allowed' })
  }

  try {
    validate(req.body)
  } catch (error) {
    return res.status(400).send({ error: 'Invalid body' })
  }

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
