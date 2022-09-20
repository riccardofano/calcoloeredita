import { NextPage } from 'next'
import { PeopleProvider } from '../../context/PeopleContext'

import RelativesForm from '../../components/RelativesForm'
import { useState } from 'react'

const Home: NextPage = () => {
  const [selectedId, setSelectedId] = useState('0')
  return (
    <PeopleProvider>
      <main className="px-8 py-16">
        <RelativesForm id={selectedId} setSelectedId={setSelectedId}></RelativesForm>
      </main>
    </PeopleProvider>
  )
}

export default Home
