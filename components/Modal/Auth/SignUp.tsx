// components/Modal/Auth/SignUp.tsx
import { Button, Flex, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { authModalState } from '../../../atoms/authModalAtom';
import InputField from './InputField';
import useCustomToast from "@/hooks/useCustomToast";

const SignUp = () => {
  const setAuthModalState = useSetRecoilState(authModalState);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  const showToast = useCustomToast();
  const [loading, setLoading] = useState(false);

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Submitting form SIGNUP'); // Debugging line
    if (password !== confirmPassword) {
      setSignupError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      showToast({
        title: "Signup",
        status: response.ok ? "success" : "error",
        description: response.ok ? "Signup successful" : "Signup failed",
      });

      console.log('Response status', response.status); // Debugging line

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === "Email already in use") {
          setSignupError("Email already in use");
        } else {
          throw new Error(errorData.message || 'Signup failed');
        }
        return;
      }

      // You might want to log the user in immediately or redirect
      setAuthModalState({ open: true, view: 'login' });

    } catch (error) {
      console.error('Signup error:', error); // Debugging line
      setSignupError("Email already use, please login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <InputField name="email" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <InputField name="password" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <InputField name="confirmPassword" placeholder="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

      {signupError && <Text color="red">{signupError}</Text>}

      <Button type="submit" isLoading={loading}>Sign Up</Button>
      <Flex justifyContent="center">
        Already have an account? <Text color="blue" onClick={() => setAuthModalState({ open: true, view: 'login' })}>Log in</Text>
      </Flex>
    </form>
  );
};

export default SignUp;