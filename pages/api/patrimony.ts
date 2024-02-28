import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

import { calculatePatrimony } from '../../core/patrimony'
import { toCommonDenominator } from '../../core/commonDenominator'
import { categoryNames } from '../../core/types/Category'

const People = z.record(
  z.string().min(1),
  z.object({
    id: z.string(),
    name: z.string(),
    available: z.boolean(),
    degree: z.number(),
    previous: z.string().nullable(),
    category: z.enum(categoryNames),
    relatives: z.array(z.string()),
  })
)

// TODO: This will change when the server calculate the money too
export function validate(body: unknown) {
  const res = People.safeParse(body)

  if (!res.success) {
    throw new Error(`Failed to parse body: ${res.error}`)
  }
  if (!res.data['0']) {
    throw new Error('Body does not contain root node')
  }
  if (res.data['0'].category !== 'root') {
    throw new Error('0 is not root')
  }

  return res.data
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method not allowed' })
  }

  if (req.headers['content-type'] !== 'application/json') {
    return res.status(400).send({ error: 'Content type not allowed' })
  }

  let parsed
  try {
    parsed = People.parse(req.body)
  } catch (error) {
    console.error(error)
    return res.status(400).send({ error: 'Invalid body' })
  }

  try {
    const result = calculatePatrimony(parsed)

    if (req.query['denominatorecomune'] === 'true') {
      toCommonDenominator(result)
    }

    return res.json(result)
  } catch (error) {
    return res.status(500).send({ error: 'Failed to parse body' })
  }
}
