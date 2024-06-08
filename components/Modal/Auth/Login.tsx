import { Button, Flex, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { authModalState } from '../../../atoms/authModalAtom';
import InputField from './InputField';
import { useRouter } from 'next/router';
import useCustomToast from "@/hooks/useCustomToast";

const Login: React.FC = () => {
  const router = useRouter();
  const setAuthModalState = useSetRecoilState(authModalState);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const showToast = useCustomToast();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      showToast({
        title: "Login",
        status: response.ok ? "success" : "error",
        description: response.ok ? "Login successful" : "Login failed",
      });

      if (response.ok) {
        const result = await response.json();
        window.location.href = '/';
        window.location.reload();
        if (result.status !== 'success') {
          setLoginError(result.message);
        }
      } else {
        const errorData = await response.json();
        setLoginError(errorData.message);
        setTimeout(() => {
          setLoginError('');
        }, 3000);
      }
    } catch (error) {
      setTimeout(() => {
        setLoginError('');
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <InputField name="email" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <InputField name="password" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

      {loginError && <Text color="red">{loginError}</Text>}

      <Button type="submit" isLoading={loading}>Log In</Button>
      <Flex justifyContent="center">
        No account? <Text color="blue" onClick={() => setAuthModalState({ open: true, view: 'signup' })}>Sign up</Text>
      </Flex>
    </form>
  );
};

export default Login;