import type { AppProps } from 'next/app'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import React from 'react'

const theme = extendTheme({
  text: {
    default: 'gray.700',
  },
})

function MyApp({ Component, pageProps }: AppProps) {
  if (typeof document === 'undefined') {
    React.useLayoutEffect = React.useEffect
  }
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default MyApp
