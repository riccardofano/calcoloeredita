import { Center, Code, Container, Heading } from '@chakra-ui/react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'

import Information from '../components/information'

import { Person } from '../utils/person'

const Home: NextPage = () => {
  const [children, setChildren] = useState<Person[]>([])
  const [spouse, setSpouse] = useState<Person>()
  const [parents, setParents] = useState<Person[]>([])
  const [siblings, setSiblings] = useState<Person[]>([])

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
        <Information title={'Quanti figli ha?'} people={children} setPeople={setChildren} />
        {/* <Information title={'Ha un coniuge?'} person={spouse} setPerson={setSpouse} /> */}
        {children.length === 0 && (
          <>
            <Information title={'Quanti genitori ha?'} people={parents} setPeople={setParents} />
            <Information title={'Quanti fratelli ha?'} people={siblings} setPeople={setSiblings} />
          </>
        )}

        <Code>{`${JSON.stringify({ deceased: { children, spouse, parents, siblings } })}`}</Code>
      </main>
    </Container>
  )
}

export default Home
