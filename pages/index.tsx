import { Box, Button, Center, Code, Container, FormControl, FormLabel, Heading, Input } from '@chakra-ui/react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'

import Information from '../components/information'
import { calculateInheritance } from '../utils/inheritance'

import { Person } from '../utils/person'

const Home: NextPage = () => {
  const [name, setName] = useState<string | undefined>()
  const [children, setChildren] = useState<Person[]>([])
  const [spouse, setSpouse] = useState<Person>()
  const [parents, setParents] = useState<Person[]>([])
  const [siblings, setSiblings] = useState<Person[]>([])

  const showInhertance = () => {
    if (name) {
      const deceased = calculateInheritance({ name, children, spouse, parents, siblings })
      if (deceased) {
        setChildren(deceased.children ?? children)
        setSpouse(deceased.spouse ?? spouse)
        setParents(deceased.parents ?? parents)
        setSiblings((deceased?.siblings ?? []).concat(deceased?.unilateral ?? []) ?? siblings)
      }
    }
  }

  return (
    <Container maxWidth="container.lg" padding="8">
      <Head>
        <title>Calcolo eredità</title>
        <meta name="description" content="Calcola l'eredità per successione legittima." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Center>
          <Heading as="h1">Calcola eredità</Heading>
        </Center>
        <FormControl isInvalid={name === ''} isRequired>
          <FormLabel htmlFor="name">Nome del defunto</FormLabel>
          <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}></Input>
        </FormControl>
        <Information title={'Quanti figli ha?'} people={children} setPeople={setChildren} />
        {/* <Information title={'Ha un coniuge?'} person={spouse} setPerson={setSpouse} /> */}
        {children.length === 0 && (
          <>
            <Information title={'Quanti genitori ha?'} people={parents} setPeople={setParents} />
            <Information title={'Quanti fratelli ha?'} people={siblings} setPeople={setSiblings} />
          </>
        )}

        <Box>
          <Button
            type="submit"
            colorScheme="green"
            isDisabled={!(name && (children.length || spouse || parents.length || siblings.length))}
            onClick={showInhertance}
          >
            Calcola
          </Button>
        </Box>

        <Code>{`${JSON.stringify({ deceased: name, children, spouse, parents, siblings })}`}</Code>
      </main>
    </Container>
  )
}

export default Home
