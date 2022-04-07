import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { Box, Button, Center, Container, FormControl, FormLabel, Heading, Input, SimpleGrid } from '@chakra-ui/react'

import CategoryButton from '../components/categoryButton'

import { calculateInheritance } from '../utils/inheritance'
import { Person } from '../utils/person'
import List from '../components/list'
import React from 'react'
import { Categories, CategoryContext, categoryNames, defaultState } from '../context/Category'

const Home: NextPage = () => {
  const [categories, setCategories] = useState<Categories>(defaultState)
  const [disabled, setDisabled] = useState<boolean>(false)
  const [deceased, setDeceased] = useState<Person>({
    name: 'Defunto',
    alive: false,
    id: '1',
    category: 'children',
    children: [],
    spouse: [],
    parents: [],
    siblings: [],
    unilateral: [],
    others: [],
  })

  useEffect(() => {
    const relatives = [
      deceased.children,
      deceased.spouse,
      deceased.parents,
      deceased.siblings,
      deceased.unilateral,
      deceased.others,
    ]
    setDisabled(!(deceased.name && relatives.some((c) => c.length > 0)))
  }, [deceased])

  useEffect(() => {
    setDisabled(true)
  }, [])

  const showInhertance = () => {
    const updated = calculateInheritance(deceased)
    setDeceased(updated)
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
        <FormControl isInvalid={deceased.name === ''} isRequired>
          <FormLabel htmlFor="name">Nome del defunto</FormLabel>
          <Input
            id="name"
            type="text"
            value={deceased.name}
            onChange={(e) => setDeceased((state) => ({ ...state, name: e.target.value }))}
          ></Input>
        </FormControl>

        <CategoryContext.Provider value={{ categories, setCategories }}>
          {categoryNames.map((c) => (
            <CategoryButton key={c} category={c}></CategoryButton>
          ))}

          <List person={deceased} updatePerson={setDeceased}></List>
        </CategoryContext.Provider>

        <Box marginBlockEnd="48">
          <Button type="submit" colorScheme="green" isDisabled={disabled} onClick={showInhertance}>
            Calcola
          </Button>
        </Box>
      </SimpleGrid>
    </Container>
  )
}

export default Home
