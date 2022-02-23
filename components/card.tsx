import { DeleteIcon } from '@chakra-ui/icons'
import { Box, Checkbox, CircularProgress, Text, Flex, IconButton, Input } from '@chakra-ui/react'
import { ChangeEvent } from 'react'
import { CategoryName } from '../context/Category'
import { Person } from '../utils/person'
import SubList from './subList'

interface CardProps {
  person: Person
  index: number
  category: CategoryName
  removePerson: (index: number) => void
  updatePerson: (index: number, person: Person) => void
}

const Card = ({ person, index, category, removePerson, updatePerson }: CardProps) => {
  const changeName = (e: ChangeEvent<HTMLInputElement>) => {
    const updatedPerson = { ...person, name: e.target.value }
    updatePerson(index, updatedPerson)
  }

  const changeStatus = (e: ChangeEvent<HTMLInputElement>) => {
    const updatedPerson = { ...person, alive: !e.target.checked }
    updatePerson(index, updatedPerson)
  }

  const setPerson = (updated: Person) => {
    const updatedPerson = { ...updated }
    updatePerson(index, updatedPerson)
  }

  const inheritance = Math.round(person.inheritance ?? 0)

  return (
    <Box>
      <Flex gap="8" alignItems="center" justifyContent="space-between">
        {person.inheritance && (
          <Flex gap="2" alignItems="center">
            <Text>{inheritance}%</Text>
            <CircularProgress size="1.5em" value={inheritance}></CircularProgress>
          </Flex>
        )}
        <Input id="name" value={person.name} type="text" placeholder="Nome e cognome" onChange={changeName} />

        <Checkbox size="lg" isChecked={!person.alive} onChange={changeStatus}>
          Premorto?
        </Checkbox>
        <IconButton
          colorScheme="red"
          aria-label="Rimuovi persona"
          onClick={() => removePerson(index)}
          icon={<DeleteIcon />}
        ></IconButton>
      </Flex>
      {!person.alive && <SubList category={category} person={person} updatePerson={setPerson}></SubList>}
    </Box>
  )
}

export default Card
