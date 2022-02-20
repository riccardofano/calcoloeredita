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
  children: ['children', 'spouse'],
  spouse: ['children', 'parents', 'siblings'],
  parents: ['parents', 'siblings'],
  siblings: ['children'],
}

const SubList = ({ person, category, updatePerson }: SubListProps) => {
  const updatePeople = (category: CategoryName, people: Person[]) => {
    const updatedCategory = { ...person, [category]: people }
    updatePerson(updatedCategory)
  }

  return (
    <UnorderedList>
      {allowedCategories[category].map((c, i) => (
        <ListItem key={i} category={c} people={person[category]} setPeople={updatePeople} />
      ))}
    </UnorderedList>
  )
}

export default SubList
