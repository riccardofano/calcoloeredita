import { UnorderedList } from '@chakra-ui/react'
import { Dispatch, SetStateAction, useEffect } from 'react'

import { CategoryName, categoryNames, useCategories } from '../context/Category'
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

  useEffect(() => {
    // Set every disabled category to an empty array
    const categoriesDisabled = categoryNames.filter((c) => categories[c] === false)
    const updatedPerson = {
      ...person,
      ...categoriesDisabled.reduce<Record<string, Person[]>>((acc, category) => {
        acc[category] = []
        return acc
      }, {}),
    }
    updatePerson(updatedPerson)
  }, [categories])

  return (
    <UnorderedList styleType="none" marginInlineStart="none">
      {entries
        .filter(([_, allowed]) => allowed)
        .map(([category]) => {
          return (
            <ListItem
              key={category}
              category={category}
              people={person[category]}
              setPeople={updatePeople}
              directRelative
            ></ListItem>
          )
        })}
    </UnorderedList>
  )
}

export default List
