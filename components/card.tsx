import { DeleteIcon } from '@chakra-ui/icons'
import { Checkbox, Flex, IconButton, Input } from '@chakra-ui/react'
import { ChangeEvent } from 'react'
import { Person } from '../utils/person'

interface CardProps {
  person: Person
  index: number
  onNameChange: (e: ChangeEvent<HTMLInputElement>, i: number) => void
  onDeadChange: (e: ChangeEvent<HTMLInputElement>, i: number) => void
  onRemove: (i: number) => void
}

const Card = ({ person, index, onNameChange, onDeadChange, onRemove }: CardProps) => {
  return (
    <Flex gap="8" alignItems="center" justifyContent="space-between">
      <Input
        id="name"
        value={person.name}
        type="text"
        placeholder="Nome e cognome"
        onChange={(e) => onNameChange(e, index)}
      />

      <Checkbox size="lg" isChecked={person.predead} onChange={(e) => onDeadChange(e, index)}>
        Premorto?
      </Checkbox>
      <IconButton
        colorScheme="red"
        aria-label="Rimuovi persona"
        onClick={() => onRemove(index)}
        icon={<DeleteIcon />}
      ></IconButton>
      {/* {person.predead && (
        <Box>
          <a href="#">Fammi sapere di più</a>
        </Box>
      )} */}
    </Flex>
  )
}

export default Card
