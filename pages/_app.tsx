import type { AppProps } from 'next/app'
import { PeopleProvider } from '../context/PeopleContext'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PeopleProvider>
      <Component {...pageProps} />
    </PeopleProvider>
  )
}

export default MyApp
