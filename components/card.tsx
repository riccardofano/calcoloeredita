import { Box, FormControl, FormLabel, Input } from '@chakra-ui/react'
import { ChangeEvent } from 'react'
import { Person } from '../utils/person'

interface CardProps {
  handleName: (e: ChangeEvent<HTMLInputElement>, i: number) => void
  person: Person
  index: number
}

const Card = ({ person, index, handleName }: CardProps) => {
  return (
    <Box maxWidth="md" borderWidth="1px" borderRadius="lg" p="6" color="gray.500">
      <FormControl>
        <FormLabel htmlFor="name">Nome</FormLabel>
        <Input id="name" value={person.name} type="text" onChange={(e) => handleName(e, index)} />
      </FormControl>
    </Box>
  )
}

export default Card
