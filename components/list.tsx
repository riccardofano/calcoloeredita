import { UnorderedList } from '@chakra-ui/react'
import { Dispatch, SetStateAction, useEffect } from 'react'

import { useCategories } from '../context/Category'
import { CategoryName, categoryNames } from '../utils/types/Category'
import { Person } from '../utils/types/Person'
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

    updatePerson((state) => {
      return categoriesDisabled.reduce(
        (s, category) => {
          s[category] = []
          return s
        },
        { ...state }
      )
    })
  }, [categories, updatePerson])

  return (
    <UnorderedList styleType="none" marginInlineStart="none">
      {entries
        .filter(([, allowed]) => allowed)
        .map(([category]) => {
          return (
            <ListItem key={category} category={category} people={person[category]} setPeople={updatePeople}></ListItem>
          )
        })}
    </UnorderedList>
  )
}

export default List
