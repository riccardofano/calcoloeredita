import { AddIcon } from '@chakra-ui/icons'
import { ListItem as Li, Heading, SimpleGrid, Flex, IconButton } from '@chakra-ui/react'
import { v4 as uuid } from 'uuid'
import { CategoryName } from '../context/Category'
import { Person } from '../utils/person'

import Card from './card'

interface ListItemProps {
  category: CategoryName
  people?: Person[]
  setPeople: (category: CategoryName, people: Person[]) => void
  directRelative?: boolean
}

const title: Record<CategoryName, string> = {
  children: 'Figli',
  spouse: 'Coniuge',
  parents: 'Genitori',
  siblings: 'Fratelli e sorelle germani',
  unilateral: 'Fratelli e sorelle unilaterali',
  others: 'Altri parenti',
}

const maxPeople: Record<CategoryName, number> = {
  children: 20,
  spouse: 1,
  parents: 2,
  siblings: 20,
  unilateral: 20,
  others: 50,
}

const ListItem = ({ category, people, setPeople, directRelative }: ListItemProps) => {
  const updatePerson = (index: number, person: Person) => {
    const updatedPeople = [...(people || [])]
    updatedPeople[index] = person
    setPeople(category, updatedPeople)
  }

  const addPerson = () => {
    const updatedPeople = [...(people || [])]
    updatedPeople.push({
      name: '',
      alive: true,
      id: uuid(),
      category,
      children: [],
      spouse: [],
      parents: [],
      siblings: [],
      unilateral: [],
      others: [],
    })
    setPeople(category, updatedPeople)
  }

  const removePerson = (index: number) => {
    if (!people) return
    const updatedPeople = [...people]
    updatedPeople.splice(index, 1)
    setPeople(category, updatedPeople)
  }

  return (
    <Li>
      <Flex alignItems="center" gap="4">
        {(people?.length || 0) < maxPeople[category] && (
          <IconButton aria-label="aggiungi" icon={<AddIcon />} onClick={addPerson} />
        )}
        <Heading as="h3" size="md" paddingBlock="4">
          {title[category]}:
        </Heading>
      </Flex>
      <SimpleGrid column={1} spacing="2" rowGap="4">
        {people?.map((person, index) => (
          <Card
            key={person.id}
            person={person}
            index={index}
            category={category}
            directRelative={directRelative}
            removePerson={removePerson}
            updatePerson={updatePerson}
          ></Card>
        ))}
      </SimpleGrid>
    </Li>
  )
}

export default ListItem
