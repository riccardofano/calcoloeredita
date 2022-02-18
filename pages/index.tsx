import { Box, Code, Container, Heading } from '@chakra-ui/react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'

import Information from '../components/information'

import { Person } from '../utils/person'

const Home: NextPage = () => {
  const [children, setChilden] = useState<Person[]>([])

  return (
    <Container>
      <Head>
        <title>Calcolo eredità</title>
        <meta name="description" content="Calcola l'eredità per successione legittima." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Heading as="h1">Calcola eredità</Heading>
        <Box>
          <Information title={'Ha figli?'} people={children} setPeople={setChilden} />
        </Box>

        <Code>{`${JSON.stringify({ children })}`}</Code>
      </main>
    </Container>
  )
}

export default Home
