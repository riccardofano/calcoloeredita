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
import { ChangeEvent, Dispatch, SetStateAction } from 'react'

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

    setPeople((oldPeople) =>
      numberPeople > oldPeople.length
        ? oldPeople.concat(Array(numberPeople - oldPeople.length).fill({ name: '' }))
        : oldPeople.slice(0, numberPeople - oldPeople.length)
    )
  }

  const updateValue = (index: number, key: string, value: unknown) => {
    const newPeople = [...people]
    newPeople[index] = { ...newPeople[index], [key]: value }
    setPeople(newPeople)
  }

  const handleName = (e: ChangeEvent<HTMLInputElement>, i: number) => {
    updateValue(i, 'name', e.target.value)
  }

  const handleDeath = (e: ChangeEvent<HTMLInputElement>, i: number) => {
    updateValue(i, 'predead', e.target.checked)
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
          {people.map((person, index) => (
            <Card key={index} person={person} index={index} onNameChange={handleName} onDeadChange={handleDeath}></Card>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  )
}

export default Information
