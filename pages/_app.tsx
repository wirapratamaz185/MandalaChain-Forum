import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { theme } from "@/chakra/theme";
import Layout from "@/components/Layout/Layout";
import { RecoilRoot } from "recoil";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) {

      localStorage.setItem("access_token", token);
      const tkn =  localStorage.getItem("access_token");
      // console.log('ajskajkdssajkdjkasj', tkn);
      
      // console.log('TOKEN', tkn);
      
      router.replace(router.pathname); // Remove the token from the URL
    }
  }, [router]);

  return (
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
  );
}