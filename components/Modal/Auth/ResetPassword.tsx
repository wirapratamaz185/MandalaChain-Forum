// components/Modal/Auth/ResetPassword.tsx
import { Button, Flex, Input, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { useSetRecoilState } from "recoil";
import { authModalState } from "../../../atoms/authModalAtom";

const ResetPassword: React.FC = () => {
    const setAuthModalState = useSetRecoilState(authModalState);
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleResetPassword = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (response.ok) {
                setSuccess(true);
            } else {
                throw new Error(data.message || "Failed to reset password");
            }
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex direction="column" align="center" justify="center" p={4}>
            {!success ? (
                <>
                    <Text fontSize="xl" fontWeight="bold" mb={4}>Reset Your Password</Text>
                    <Input
                        placeholder="Enter your email"
                        size="lg"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        mb={2}
                        isInvalid={!!error}
                    />
                    <Button
                        isLoading={loading}
                        onClick={handleResetPassword}
                        colorScheme="blue"
                        width="full"
                        mt={2}
                    >
                        Send Reset Link
                    </Button>
                    {error && <Text color="red.500" mt={2}>{error}</Text>}
                </>
            ) : (
                <Text fontSize="lg" color="green.500">
                    Check your email to reset the password.
                </Text>
            )}
        </Flex>
    );
};

export default ResetPassword;