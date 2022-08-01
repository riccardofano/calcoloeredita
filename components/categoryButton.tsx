import { Checkbox, Box } from '@chakra-ui/react'
import { useCategory } from '../context/Category'
import { CategoryName } from '../utils/types/Category'

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

  return (
    <Box>
      <Checkbox size="lg" type="checkbox" id={category} isChecked={checked} onChange={() => setChecked(!checked)}>
        {text[category]}
      </Checkbox>
    </Box>
  )
}

export default Button
