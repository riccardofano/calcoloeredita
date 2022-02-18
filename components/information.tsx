import { Box, Heading, Input, SimpleGrid } from '@chakra-ui/react'
import { ChangeEvent, Dispatch, FormEvent, SetStateAction, useState } from 'react'

import Card from './card'
import { Person } from '../utils/person'

interface InformationProps {
  title: string
  people: Person[]
  setPeople: Dispatch<SetStateAction<Person[]>>
}

const Information = ({ title, people, setPeople }: InformationProps) => {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const numberPeople = parseInt(number)
    if (isNaN(numberPeople) || numberPeople < 0 || numberPeople === people.length) {
      return
    }

    let newPeople: Person[] =
      numberPeople > people.length
        ? people.concat(Array(numberPeople - people.length).fill({ name: '' }))
        : people.slice(0, numberPeople - people.length)

    setPeople(newPeople)
  }

  const changeName = (e: ChangeEvent<HTMLInputElement>, i: number) => {
    const newPeople = [...people]
    newPeople[i] = { ...newPeople[i], name: e.target.value }
    setPeople(newPeople)
  }

  const [number, setNumber] = useState('0')

  return (
    <Box>
      <Heading as="h2">{title}</Heading>
      <Box>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            value={number}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNumber(e.target.value)}
          />
        </form>
        <SimpleGrid minChildWidth="250px" spacing="2" marginTop="4">
          {people.map((p, i) => (
            <Card key={i} person={p} index={i} handleName={changeName}></Card>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  )
}

export default Information
