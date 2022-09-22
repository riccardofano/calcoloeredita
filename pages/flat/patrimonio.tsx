import { NextPage } from 'next'
import { FormEvent, useState } from 'react'

import { ModeProvider } from '../../context/ModeContext'
import { usePeopleContext } from '../../context/PeopleContext'

import Main from '../../templates/Main'

const Patrimony: NextPage = () => {
  const [inheritance, setInheritance] = useState<Record<string, string>>({})
  const [isEditing, setIsEditing] = useState(true)
  const list = usePeopleContext()

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const result = await fetch('/api/patrimony', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(list),
    })

    if (result.ok) {
      const updatedInheritance = await result.json()
      setInheritance(updatedInheritance)
    }

    setIsEditing(false)
  }

  return (
    <ModeProvider mode="patrimony">
      <Main isEditing={isEditing} setIsEditing={setIsEditing} inheritance={inheritance} onSubmit={onSubmit} />
    </ModeProvider>
  )
}

export default Patrimony
