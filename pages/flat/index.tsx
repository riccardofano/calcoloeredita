import { NextPage } from 'next'
import { PeopleProvider } from '../../context/PeopleContext'

import RelativesForm from '../../components/RelativesForm'

const Home: NextPage = () => {
  return (
    <PeopleProvider>
      <RelativesForm id={'0'}></RelativesForm>
    </PeopleProvider>
  )
}

export default Home
