import { DeleteIcon } from '@chakra-ui/icons'
import { Box, Checkbox, CircularProgress, Text, Flex, IconButton, Input, Select } from '@chakra-ui/react'
import { ChangeEvent, useContext } from 'react'
import Fraction from 'fraction.js'

import { CategoryName } from '../utils/types/Category'
import { Person } from '../utils/types/Person'
import SubList from './subList'
import { InheritanceContext } from '../context/Inheritance'

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

  const changeDegree = (e: ChangeEvent<HTMLSelectElement>) => {
    const updatedPerson = { ...person, degree: Number(e.target.value) || 999 }
    updatePerson(index, updatedPerson)
  }

  const setPerson = (updated: Person) => {
    const updatedPerson = { ...updated }
    updatePerson(index, updatedPerson)
  }

  const { inheritanceList } = useContext(InheritanceContext)
  const inheritance = inheritanceList[person.id] ?? 0

  return (
    <Box>
      <Flex gap="8" alignItems="center" justifyContent="space-between">
        <Input id="name" value={person.name} type="text" placeholder="Nome e cognome" onChange={changeName} />
        {category === 'others' && (
          <Select placeholder="Parente (grado di parentela)" onChange={(e) => changeDegree(e)} required>
            <option value={3}>Zio/a (3)</option>
            <option value={4}>Cugino/a (4)</option>
            <option value={5}>Figlio/a di cugino/a (5)</option>
            <option value={6}>Nipote di cugino/a (6)</option>
            <option value={4}>Prozio/a (4)</option>
            <option value={5}>Secondo cugino/a (5)</option>
            <option value={6}>Figlio/a di secondo/a cugino/a (6)</option>
            <option value={5}>Fratello/Sorella di bisavo (5)</option>
            <option value={6}>Nipote di trisavo (6)</option>
          </Select>
        )}

        <Checkbox size="lg" isChecked={!person.alive} onChange={changeStatus}>
          Premorto?
        </Checkbox>
        <IconButton
          colorScheme="red"
          aria-label="Rimuovi persona"
          onClick={() => removePerson(index)}
          icon={<DeleteIcon />}
        ></IconButton>
        {
          <Flex gap="2" alignItems="center">
            <Text>{new Fraction(inheritance / 100).toFraction(true)}</Text>
            <CircularProgress size="1.5em" value={inheritance}></CircularProgress>
          </Flex>
        }
      </Flex>
      {!person.alive && <SubList category={category} person={person} updatePerson={setPerson}></SubList>}
    </Box>
  )
}

export default Card
