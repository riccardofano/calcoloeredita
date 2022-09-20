import { NextPage } from 'next'
import { PeopleProvider } from '../../context/PeopleContext'

import RelativesForm from '../../components/RelativesForm'
import { useState } from 'react'

const Home: NextPage = () => {
  const [selectedId, setSelectedId] = useState('0')
  return (
    <PeopleProvider>
      <RelativesForm id={selectedId} setSelectedId={setSelectedId}></RelativesForm>
    </PeopleProvider>
  )
}

export default Home
