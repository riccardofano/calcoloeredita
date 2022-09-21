import { NextPage } from 'next'
import { usePeopleContext } from '../../context/PeopleContext'

import RelativesForm from '../../components/RelativesForm'
import { FormEvent, useState } from 'react'
import RelativesList from '../../components/RelativesList'

const Home: NextPage = () => {
  const [selectedId, setSelectedId] = useState('0')
  const [editing, setEditing] = useState(true)
  const [inheritance, setInheritance] = useState<Record<string, string>>({})

  const list = usePeopleContext()

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const result = await fetch('/api/inheritance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(list),
    })

    if (result.ok) {
      const updatedInheritance = await result.json()
      setInheritance(updatedInheritance)
    }

    setEditing(false)
  }

  return (
    <main className="px-8 py-16">
      {editing ? (
        <form className="space-y-2" onSubmit={onSubmit}>
          <RelativesForm id={selectedId} setSelectedId={setSelectedId} onSubmit={onSubmit}></RelativesForm>
        </form>
      ) : (
        <RelativesList inheritance={inheritance} />
      )}
    </main>
  )
}

export default Home
