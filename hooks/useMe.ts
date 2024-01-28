import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { usePeopleContext } from '../context/PeopleContext'
import { Person, PersonList } from '../core/types/Person'

export function useMe(id: string): { me: Person | undefined; list: PersonList } {
  const router = useRouter()
  const list = usePeopleContext()
  const me = list[id]

  useEffect(() => {
    if (!me) {
      router.replace('?id=0')
    }
  }, [me, router])

  return { me, list }
}
