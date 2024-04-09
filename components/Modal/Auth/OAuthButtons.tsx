import { Box, Button, Image, Stack, Text } from "@chakra-ui/react";
import React from "react";
import { signIn, signOut, useSession } from 'next-auth/react'

const OAuthButtons: React.FC = () => {
  const { data: session } = useSession()

  if (session && session.user) {
    return (
      <Stack direction="row" spacing={2} width="100%" mb={1.5} mt={2}>
        <Text>{session.user.name}</Text>
        <Button onClick={() => signOut()}>Sign Out</Button>
      </Stack>
    )
  }

  return (
    <Box width="100%">
      <Stack direction="row" spacing={2} width="100%" mb={1.5} mt={2}>
        {/* Google */}
        <Button
          onClick={() => signIn('google')}
        >
          Sign in with Google
        </Button>

        {/* GitHub */}
        <Button
          onClick={() => signIn('github')}
        >
          Sign in with GitHub
        </Button>
      </Stack>
    </Box>
  )
}
