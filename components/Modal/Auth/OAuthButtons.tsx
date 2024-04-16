import { Box, Button, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import { signIn, signOut, useSession } from 'next-auth/react';
import { FaGoogle, FaGithub } from 'react-icons/fa'; // Import icons

const OAuthButtons: React.FC = () => {
  const { data: session } = useSession();
  const buttonBg = useColorModeValue('gray.100', 'gray.700'); // Adjust button background based on color mode

  if (session && session.user) {
    return (
      <Stack direction="row" spacing={2} width="100%" mb={1.5} mt={2}>
        <Text>{session.user.name}</Text>
        <Button onClick={() => signOut()}>Sign Out</Button>
      </Stack>
    );
  }

  return (
    <Box width="100%">
      <Stack direction="row" spacing={2} width="100%" mb={1.5} mt={2}>
        {/* Google */}
        <Button
          leftIcon={<FaGoogle />} // Add Google icon
          backgroundColor={buttonBg}
          onClick={() => signIn('google')}
        >
          Sign in with Google
        </Button>

        {/* GitHub */}
        <Button
          leftIcon={<FaGithub />} // Add GitHub icon
          backgroundColor={buttonBg}
          onClick={() => signIn('github')}
        >
          Sign in with GitHub
        </Button>
      </Stack>
    </Box>
  );
};

export default OAuthButtons;