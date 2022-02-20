import { Heading } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useCategory, CategoryName } from '../context/Category'

interface ButtonProps {
  category: CategoryName
}

const text: Record<CategoryName, string> = {
  children: 'Ha figli?',
  spouse: 'Ha coniuge?',
  parents: 'Ha ascendenti?',
  siblings: 'Ha fratelli o sorelle?',
}

const Button = ({ category }: ButtonProps) => {
  const [checked, setChecked] = useCategory(category)
  const [childrenChecked] = useCategory('children')
  const isDisabled = (category === 'siblings' || category === 'parents') && childrenChecked

  useEffect(() => {
    setChecked(checked && !isDisabled)
  }, [isDisabled])

  return (
    <>
      <input
        type="checkbox"
        id={category}
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        disabled={isDisabled}
      />
      <label htmlFor={category}>
        <Heading as="h2" size="lg">
          {text[category]}
        </Heading>
      </label>
    </>
  )
}

export default Button
