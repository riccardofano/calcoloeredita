import { AddIcon } from '@chakra-ui/icons'
import { ListItem as Li, Button, Heading, SimpleGrid, Box, Flex, IconButton } from '@chakra-ui/react'
import { ChangeEvent, Dispatch, SetStateAction } from 'react'
import { CategoryName } from '../context/Category'
import { Person } from '../utils/person'

import Card from './card'

interface ListItemProps {
  category: CategoryName
  peopleDispatch: [Person[], Dispatch<SetStateAction<Person[]>>]
}

const title: Record<CategoryName, string> = {
  children: 'Figli:',
  spouse: 'Coniuge:',
  parents: 'Ascendenti:',
  siblings: 'Fratelli e sorelle:',
}

const maxPeople: Record<CategoryName, number> = {
  children: 20,
  spouse: 1,
  parents: 2,
  siblings: 20,
}

const ListItem = ({ category, peopleDispatch: [people, setPeople] }: ListItemProps) => {
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

  const handleRemove = (i: number) => {
    const newPeople = [...people]
    newPeople.splice(i, 1)
    setPeople(newPeople)
  }

  const addPerson = () => {
    const newPeople = [...people]
    newPeople.push({ name: '' })
    setPeople(newPeople)
  }

  return (
    <Li>
      <Flex alignItems="center" gap="4">
        {people.length < maxPeople[category] && (
          <IconButton aria-label="aggiungi" icon={<AddIcon />} onClick={addPerson} />
        )}
        <Heading as="h3" size="md" paddingBlock="4">
          {title[category]}
        </Heading>
      </Flex>
      <SimpleGrid column={1} spacing="2" rowGap="4">
        {people.map((person, index) => (
          <Card
            key={index}
            person={person}
            index={index}
            onNameChange={handleName}
            onDeadChange={handleDeath}
            onRemove={handleRemove}
          ></Card>
        ))}
      </SimpleGrid>
    </Li>
  )
}

export default ListItem
