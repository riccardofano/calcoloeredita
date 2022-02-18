import { Box, Heading, Input, Wrap, WrapItem } from '@chakra-ui/react'
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
      <Heading as="h2">{title}</Heading>
      <Box>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            value={number}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNumber(e.target.value)}
          />
        </form>
        <Wrap>
          {people.map((p, i) => (
            <WrapItem key={i}>
              <label htmlFor=""></label>
              <Input type="text" value={p.name} onChange={(e: ChangeEvent<HTMLInputElement>) => changeName(e, i)} />
            </WrapItem>
          ))}
        </Wrap>
      </Box>
    </div>
  )
}

export default Information
