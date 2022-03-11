import { UnorderedList } from '@chakra-ui/react'
import { CategoryName } from '../context/Category'
import { Person } from '../utils/person'
import ListItem from './listItem'

interface SubListProps {
  person: Person
  updatePerson: (person: Person) => void
  category: CategoryName
}

const allowedCategories: Record<CategoryName, CategoryName[]> = {
  children: ['children'],
  spouse: [],
  parents: ['parents', 'children'],
  siblings: ['children'],
  unilateral: [],
}

const SubList = ({ person, category, updatePerson }: SubListProps) => {
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
      {allowedCategories[category].map((c, i) => (
        <ListItem key={i} category={c} people={person[c]} setPeople={updatePeople} />
      ))}
    </UnorderedList>
  )
}

export default SubList
