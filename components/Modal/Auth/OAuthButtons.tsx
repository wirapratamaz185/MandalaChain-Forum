import { Box, Button, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import { FaGoogle, FaGithub } from 'react-icons/fa'; // Import icons

const OAuthButtons: React.FC = () => {
  const buttonBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box width="100%">
      <Stack direction="row" spacing={10} width="100%" mb={1} mt={2}>
        <Button
          leftIcon={<FaGoogle />}
          backgroundColor={buttonBg} 
          onClick={() => window.open('/api/auth/google', '_self')}
        >
          Sign in with Google
        </Button>

        <Button
          leftIcon={<FaGithub />}
          backgroundColor={buttonBg}
          onClick={() => window.open('/api/auth/github', '_self')}
        >
          Sign in with GitHub
        </Button>
      </Stack>
    </Box>
  );
};

export default OAuthButtons;