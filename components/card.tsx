import { Box, Checkbox, FormControl, FormLabel, Input } from '@chakra-ui/react'
import { ChangeEvent } from 'react'
import { Person } from '../utils/person'

interface CardProps {
  person: Person
  index: number
  onNameChange: (e: ChangeEvent<HTMLInputElement>, i: number) => void
  onDeadChange: (e: ChangeEvent<HTMLInputElement>, i: number) => void
}

const Card = ({ person, index, onNameChange, onDeadChange }: CardProps) => {
  return (
    <Box maxWidth="md" borderWidth="1px" borderRadius="lg" p="6" color="gray.500">
      <FormControl>
        <FormLabel htmlFor="name">Nome</FormLabel>
        <Input id="name" value={person.name} type="text" onChange={(e) => onNameChange(e, index)} />
        <Checkbox marginTop="4" isChecked={person.predead} onChange={(e) => onDeadChange(e, index)}>
          Premorto?
        </Checkbox>
        {person.predead && (
          <Box>
            <a href="#">Fammi sapere di più</a>
          </Box>
        )}
      </FormControl>
    </Box>
  )
}

export default Card
