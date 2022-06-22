import { ChakraProvider } from "@chakra-ui/react";
import { Provider } from "urql";

import { AppProps } from "next/app";
import theme from "../theme";
import { Navbar } from "../components/Navbar";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
