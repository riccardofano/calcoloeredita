import { NextApiRequest, NextApiResponse } from 'next'
import { calculateInheritance } from '../../../core/inheritance'
import { defaultRoot, invertGraph } from '../../../core/invertGraph'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method not allowed' })
  }

  if (req.headers['content-type'] !== 'application/json') {
    return res.status(400).send({ error: 'Content type not allowed' })
  }

  try {
    const graph = invertGraph(defaultRoot(), req.body)
    const result = calculateInheritance(graph)
    return res.json(result)
  } catch (error) {
    return res.status(500).send({ error: 'Failed to parse body' })
  }
}
