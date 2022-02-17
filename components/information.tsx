import { ChangeEvent, Dispatch, FormEvent, SetStateAction, useState } from 'react'
import { Person } from '../utils/person'

interface InformationProps {
  title: string
  people: Person[]
  setPeople: Dispatch<SetStateAction<Person[]>>
}

const Information = ({ title, people, setPeople }: InformationProps) => {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const numberPeople = parseInt(number) || 0
    const arr: Person[] = Array<Person>(numberPeople).fill({ name: '' })
    setPeople(arr)
  }

  const changeName = (e: ChangeEvent<HTMLInputElement>, i: number) => {
    const newPeople = [...people]
    newPeople[i] = { ...newPeople[i], name: e.target.value }
    setPeople(newPeople)
  }

  const [number, setNumber] = useState('0')

  return (
    <div>
      <h2>{title}</h2>
      <div>
        <form onSubmit={handleSubmit}>
          <input type="text" value={number} onChange={(e) => setNumber(e.target.value)} />
        </form>
        <div>
          {people.map((p, i) => (
            <span key={i}>
              <label htmlFor=""></label>
              <input type="text" value={p.name} onChange={(e) => changeName(e, i)} />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Information
