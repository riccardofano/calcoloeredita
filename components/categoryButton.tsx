import { Checkbox, Heading, Box, FormLabel } from '@chakra-ui/react'
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
    <Box position="relative">
      <Checkbox
        left="4"
        top="4"
        borderRadius="20"
        position="absolute"
        size="lg"
        type="checkbox"
        id={category}
        isChecked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        isDisabled={isDisabled}
      />
      <FormLabel
        htmlFor={category}
        padding="10"
        alignItems="center"
        justifyContent="center"
        borderRadius="10"
        border={'2px'}
        borderColor={checked ? 'blue.500' : 'inherit'}
        opacity={isDisabled ? 0.5 : 1}
        textAlign="center"
      >
        <Heading as="h2" size="lg" userSelect="none" cursor="pointer">
          {text[category]}
        </Heading>
      </FormLabel>
    </Box>
  )
}

export default Button
