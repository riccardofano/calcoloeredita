import type { NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import {
  Box,
  Button,
  Center,
  Code,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
} from '@chakra-ui/react'

import CategoryButton from '../components/categoryButton'

import { calculateInheritance } from '../utils/inheritance'
import { Person } from '../utils/person'
import List from '../components/list'
import React from 'react'
import { Categories, CategoryContext, categoryNames, defaultState } from '../context/Category'
import { PeopleContext } from '../context/People'

const Home: NextPage = () => {
  const [name, setName] = useState<string | undefined>()
  const [children, setChildren] = useState<Person[]>([])
  const [spouse, setSpouse] = useState<Person[]>([])
  const [parents, setParents] = useState<Person[]>([])
  const [siblings, setSiblings] = useState<Person[]>([])

  const [categories, setCategories] = useState<Categories>(defaultState)

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
    <Container maxWidth="container.lg" minHeight="100vh" padding="8">
      <Head>
        <title>Calcolo eredità</title>
        <meta name="description" content="Calcola l'eredità per successione legittima." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SimpleGrid as="main" spacing="4">
        <Center>
          <Heading as="h1" size="2xl">
            Calcola eredità
          </Heading>
        </Center>
        <FormControl isInvalid={name === ''} isRequired>
          <FormLabel htmlFor="name">Nome del defunto</FormLabel>
          <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}></Input>
        </FormControl>

        <CategoryContext.Provider value={{ categories, setCategories }}>
          <SimpleGrid spacing="4" columns={2}>
            {categoryNames.map((c) => (
              <CategoryButton key={c} category={c}></CategoryButton>
            ))}
          </SimpleGrid>

          <PeopleContext.Provider
            value={{
              children: [children, setChildren],
              spouse: [spouse, setSpouse],
              parents: [parents, setParents],
              siblings: [siblings, setSiblings],
            }}
          >
            <List></List>
          </PeopleContext.Provider>
        </CategoryContext.Provider>

        <Box>
          <Button
            type="submit"
            colorScheme="green"
            isDisabled={!(name && (children.length || spouse.length || parents.length || siblings.length))}
            onClick={showInhertance}
          >
            Calcola
          </Button>
        </Box>

        <Code>{`${JSON.stringify({ deceased: name, children, spouse, parents, siblings })}`}</Code>
      </SimpleGrid>
    </Container>
  )
}

export default Home
