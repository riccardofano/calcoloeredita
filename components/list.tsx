import { UnorderedList } from '@chakra-ui/react'
import { Dispatch, SetStateAction } from 'react'
import { CategoryName, useCategories } from '../context/Category'
import { Person } from '../utils/person'
import ListItem from './listItem'

interface ListProps {
  person: Person
  updatePerson: Dispatch<SetStateAction<Person>>
}

const List = ({ person, updatePerson }: ListProps) => {
  const categories = useCategories()
  const entries = Object.entries(categories) as [CategoryName, boolean][]

  const updatePeople = (category: CategoryName, people: Person[]) => {
    const updatedCategory = { ...person, [category]: people }
    updatePerson(updatedCategory)
  }

  return (
    <UnorderedList styleType="none" marginInlineStart="none">
      {entries
        .filter(([_, allowed]) => allowed)
        .map(([category], i) => {
          return <ListItem key={i} category={category} people={person[category]} setPeople={updatePeople}></ListItem>
        })}
    </UnorderedList>
  )
}

export default List
