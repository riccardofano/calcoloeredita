import {
  Box,
  Heading,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  SimpleGrid,
} from '@chakra-ui/react'
import { ChangeEvent, Dispatch, FormEvent, SetStateAction, useState } from 'react'

import Card from './card'
import { Person } from '../utils/person'

interface InformationProps {
  title: string
  people: Person[]
  setPeople: Dispatch<SetStateAction<Person[]>>
}

const Information = ({ title, people, setPeople }: InformationProps) => {
  const changeNumber = (_: string, numberPeople: number) => {
    if (numberPeople === people.length) {
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

  return (
    <Box>
      <Heading as="h2" paddingBlock="4">
        {title}
      </Heading>
      <Box>
        <NumberInput
          size="md"
          maxW={20}
          defaultValue={people.length}
          min={0}
          max={10}
          allowMouseWheel
          onChange={changeNumber}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
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
