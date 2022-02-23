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
  const [deceased, setDeceased] = useState<Person>({ name: 'Defunto', alive: false, id: '1' })
  const [categories, setCategories] = useState<Categories>(defaultState)
  const [disabled, setDisabled] = useState<boolean | null>(null)

  useEffect(() => {
    setDisabled(
      !(
        deceased.name &&
        (deceased.children?.length || deceased.spouse?.length || deceased.parents?.length || deceased.siblings?.length)
      )
    )
  }, [deceased])

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
          <SimpleGrid spacing="4" columns={{ sm: 1, md: 2 }}>
            {categoryNames.map((c) => (
              <CategoryButton key={c} category={c}></CategoryButton>
            ))}
          </SimpleGrid>

          <List person={deceased} updatePerson={setDeceased}></List>
        </CategoryContext.Provider>

        <Box>
          <Button type="submit" colorScheme="green" disabled={disabled === true} onClick={showInhertance}>
            Calcola
          </Button>
        </Box>

        <pre>{`${JSON.stringify({ deceased }, null, 4)}`}</pre>
      </SimpleGrid>
    </Container>
  )
}

export default Home
