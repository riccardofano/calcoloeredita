import { UnorderedList } from '@chakra-ui/react'
import { CategoryName } from '../context/Category'
import { Person } from '../utils/person'
import ListItem from './listItem'

interface SubListProps {
  person: Person
  updatePerson: (person: Person) => void
  category: CategoryName
  directRelative?: boolean
}

const allowedCategories = (category: CategoryName, directRelative: boolean = false): CategoryName[] => {
  switch (category) {
    case 'children':
    case 'siblings':
      return ['children']
    case 'parents':
      return directRelative ? ['parents'] : ['parents', 'children']
    default:
      return []
  }
}

const SubList = ({ person, category, updatePerson, directRelative }: SubListProps) => {
  const updatePeople = (category: CategoryName, people: Person[]) => {
    const updatedCategory = { ...person, [category]: people }
    updatePerson(updatedCategory)
  }

  return (
    <UnorderedList
      listStyleType="none"
      margin="0"
      paddingLeft="4"
      borderLeft="1px"
      borderStyle="dashed"
      borderColor="gray.300"
    >
      {allowedCategories(category, directRelative).map((c, i) => (
        <ListItem key={i} category={c} people={person[c]} setPeople={updatePeople} />
      ))}
    </UnorderedList>
  )
}

export default SubList
