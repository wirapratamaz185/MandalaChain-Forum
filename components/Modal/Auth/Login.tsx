// modal/auth/Login.tsx
import { Button, Flex, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { authModalState } from '../../../atoms/authModalAtom';
import InputField from './InputField';
import { useRouter } from 'next/router';

const Login: React.FC = () => {
  const router = useRouter();
  const setAuthModalState = useSetRecoilState(authModalState);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Response:', response);

      if (response.ok) {
        const result = await response.json();
        window.location.href = '/';
        if (result.status === 'success') {
          router.push(result.url || '/');
        } else {
          setLoginError(result.message);
        }
      } else {
        const errorData = await response.json();
        setLoginError(errorData.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      console.error("Login Error:", error);
      // setLoginError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <InputField name="email" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <InputField name="password" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

      {loginError && <Text color="red">{loginError}</Text>}

      <Button type="submit">Log In</Button>
      <Flex justifyContent="center">
        No account? <Text color="blue" onClick={() => setAuthModalState({ open: true, view: 'signup' })}>Sign up</Text>
      </Flex>
    </form>
  );
};

export default Login;