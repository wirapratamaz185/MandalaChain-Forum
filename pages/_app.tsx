import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { theme } from "@/chakra/theme";
import Layout from "@/components/Layout/Layout";
import { RecoilRoot } from "recoil";
import Head from "next/head";
import { SessionProvider } from "next-auth/react"; 

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}> {/* Wrap with SessionProvider */}
      <RecoilRoot>
        <ChakraProvider theme={theme}>
          <Layout>
            <Head>
              <title>Forum Mandala Chain</title>
            </Head>
            <Component {...pageProps} />
          </Layout>
        </ChakraProvider>
      </RecoilRoot>
    </SessionProvider>
  );
}