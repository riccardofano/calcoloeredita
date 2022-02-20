import { UnorderedList } from '@chakra-ui/react'
import { CategoryName, useCategories } from '../context/Category'
import { usePeople } from '../context/People'
import ListItem from './listItem'

interface ListProps {}

const List = ({}: ListProps) => {
  const categories = useCategories()
  const entries = Object.entries(categories) as [CategoryName, boolean][]
  const allPeople = usePeople()

  return (
    <UnorderedList styleType="none" marginInlineStart="none">
      {allPeople &&
        entries
          .filter(([_, allowed]) => allowed)
          .map(([category, _]) => {
            return <ListItem category={category} peopleDispatch={allPeople[category]}></ListItem>
          })}
    </UnorderedList>
  )
}

export default List
