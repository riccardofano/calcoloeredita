import { NextPage } from 'next'
import { FormEvent, useState } from 'react'

import { ModeProvider } from '../context/ModeContext'
import { PeopleProvider, usePeopleContext } from '../context/PeopleContext'

import Main from '../templates/Main'

const Home: NextPage = () => {
  return (
    <PeopleProvider>
      <Content />
    </PeopleProvider>
  )
}

export default Home

function Content() {
  const [inheritance, setInheritance] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(true)
  const list = usePeopleContext()

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setIsLoading(true)
    const result = await fetch('/api/inheritance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(list),
    })
    setIsLoading(false)

    if (result.ok) {
      const updatedInheritance = await result.json()
      setInheritance(updatedInheritance)
    }

    setIsEditing(false)
  }

  return (
    <ModeProvider mode="inheritance">
      <Main
        isLoading={isLoading}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        inheritance={inheritance}
        onSubmit={onSubmit}
      ></Main>
    </ModeProvider>
  )
}
