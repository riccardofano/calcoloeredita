import type { NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'
import { Box, Button, Center, Container, FormControl, FormLabel, Heading, Input, SimpleGrid } from '@chakra-ui/react'

import CategoryButton from '../components/categoryButton'

import { Categories, categoryNames } from '../utils/types/Category'
import { Person } from '../utils/types/Person'
import List from '../components/list'
import { CategoryContext, defaultState } from '../context/Category'
import { InheritanceContext } from '../context/Inheritance'
import Link from 'next/link'

const Home: NextPage = () => {
  const [allChecked, setAllChecked] = useState<Categories>(defaultState)
  const [allDisabled, setAllDisabled] = useState<Categories>(defaultState)

  const [inheritanceList, setInheritanceList] = useState<Record<string, string>>({})
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

  const relatives = [
    deceased.children,
    deceased.spouse,
    deceased.parents,
    deceased.siblings,
    deceased.unilateral,
    deceased.others,
  ]
  const isDisabled = !(deceased.name && relatives.some((c) => c.length > 0))

  const showInhertance = async () => {
    const result = await fetch('/api/inheritance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deceased),
    })

    if (result.ok) {
      const updated = await result.json()
      setInheritanceList(updated)
    }
  }

  return (
    <Container maxWidth="container.lg" minHeight="100vh" padding="8">
      <Head>
        <title>Calcolo eredità</title>
        <meta name="description" content="Calcola l'eredità per successione legittima." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Link href="/patrimonio">
          <a style={{ textDecoration: 'underline', color: 'blue' }}>Calcolo patrimonio ➡</a>
        </Link>
      </nav>

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

        <InheritanceContext.Provider value={{ inheritanceList }}>
          <CategoryContext.Provider value={{ allChecked, allDisabled, setAllChecked, setAllDisabled }}>
            {categoryNames.map((c) => (
              <CategoryButton key={c} category={c}></CategoryButton>
            ))}

            <List person={deceased} updatePerson={setDeceased}></List>
          </CategoryContext.Provider>
        </InheritanceContext.Provider>

        <Box marginBlockEnd="48">
          <Button type="submit" colorScheme="green" isDisabled={isDisabled} onClick={showInhertance}>
            Calcola
          </Button>
        </Box>
      </SimpleGrid>
    </Container>
  )
}

export default Home
