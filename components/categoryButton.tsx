import { Checkbox, Text, Box, FormLabel } from '@chakra-ui/react'
import { useContext, useEffect } from 'react'
import { useCategory, CategoryName, CategoryContext, nonOtherCategories } from '../context/Category'

interface ButtonProps {
  category: CategoryName
}

const text: Record<CategoryName, string> = {
  children: 'Ha figli?',
  spouse: 'Ha coniuge?',
  parents: 'Ha ascendenti?',
  siblings: 'Ha fratelli o sorelle?',
  unilateral: 'Ha fratelli o sorelle unilaterali?',
  others: 'Ha altri parenti fino al sesto grado di parentela?',
}

const Button = ({ category }: ButtonProps) => {
  const [checked, setChecked] = useCategory(category)
  const { categories } = useContext(CategoryContext)
  const notOthers = nonOtherCategories()
  const isDisabled =
    ((category === 'parents' || category === 'siblings' || category === 'unilateral') && categories.children) ||
    (category === 'others' && notOthers.some((c) => c))

  useEffect(() => {
    setChecked(checked && !isDisabled)
  }, [isDisabled])

  return (
    <Box>
      <Checkbox
        size="lg"
        type="checkbox"
        id={category}
        isChecked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        isDisabled={isDisabled}
      >
        {text[category]}
      </Checkbox>
    </Box>
  )
}

export default Button
