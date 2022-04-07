import { UnorderedList } from '@chakra-ui/react'
import { CategoryName } from '../context/Category'
import { Person } from '../utils/person'
import ListItem from './listItem'

interface SubListProps {
  person: Person
  updatePerson: (person: Person) => void
  category: CategoryName
}

const allowedCategories = (category: CategoryName): CategoryName[] => {
  switch (category) {
    case 'children':
    case 'siblings':
      return ['children']
    case 'parents':
      return ['parents']
    default:
      return []
  }
}

const SubList = ({ person, category, updatePerson }: SubListProps) => {
  const updatePeople = (category: CategoryName, people: Person[]) => {
    const updatedCategory = { ...person, [category]: people }
    updatePerson(updatedCategory)
  }

  const relatives = allowedCategories(category)

  return (
    <>
      {relatives.length > 0 && (
        <UnorderedList
          listStyleType="none"
          margin="0"
          paddingLeft="4"
          paddingBottom="2"
          borderLeft="1px"
          borderBottom="1px"
          borderStyle="dashed"
          borderColor="gray.400"
          borderBottomStartRadius="1rem"
        >
          {relatives.map((c, i) => (
            <ListItem key={i} category={c} people={person[c]} setPeople={updatePeople} />
          ))}
        </UnorderedList>
      )}
    </>
  )
}

export default SubList
