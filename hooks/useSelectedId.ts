import { useRouter } from 'next/router'

export function useSelectedId() {
  const router = useRouter()
  const { id: queryId = '0' } = router.query
  // queryId could be an array when multiple id params are specified: ?id=""&id=""
  // if that's the case only use the first one
  const id = Array.isArray(queryId) ? queryId[0] : queryId

  return id
}
