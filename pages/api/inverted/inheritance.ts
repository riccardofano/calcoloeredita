import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

import { calculateInheritance } from '../../../core/inheritance'
import { defaultRoot, invertGraph } from '../../../core/invertGraph'
import { toCommonDenominator } from '../../../core/commonDenominator'

const People = z.array(
  z
    .object({
      id: z.string(),
      name: z.string(),
      available: z.boolean(),
      relation: z.string(),
      relatedTo: z.string(),
    })
    .required()
)

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method not allowed' })
  }

  if (req.headers['content-type'] !== 'application/json') {
    return res.status(400).send({ error: 'Content type not allowed' })
  }

  try {
    People.parse(req.body)
  } catch (error) {
    return res.status(400).send({ error: 'Invalid body' })
  }

  try {
    const graph = invertGraph(defaultRoot(), req.body)
    const result = calculateInheritance(graph)

    if (req.query['denominatorecomune'] === 'true') {
      toCommonDenominator(result)
    }
    return res.json(result)
  } catch (error) {
    console.error(error)
    return res.status(500).send({ error: 'Failed to parse body' })
  }
}
