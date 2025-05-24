import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  Heading,
  Text,
  Link as ChakraLink,
  Container,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { register } from "../lib/api";

export const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const redirectUrl = location.state?.redirectUrl || "/";

  const {
    mutate: signUp, // anytime we call signUp, it will call the login function
    isError,
    error,
    isPending,
  } = useMutation({
    mutationFn: register,
    onSuccess: () => {
      navigate(redirectUrl, { replace: true });
    },
    onError: (error: any) => {
      console.log(
        error?.response?.data?.message || "Invalid email or password"
      );
    },
  });

  return (
    <Flex minH="100vh" align="center" justify="center">
      <Container mx="auto" maxW="md" py={12} px={6} textAlign="center">
        <Heading fontSize="4xl" mb={8}>
          Create your account
        </Heading>
        <Box rounded="lg" bg="gray.700" boxShadow="lg" p={8}>
          {isError && (
            <Box mb={3} color="red.400">
              Invalid email or password
            </Box>
          )}
          <Stack spacing={4}>
            <FormControl id="email">
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </FormControl>
            <FormControl id="password">
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && email && password.length >= 6) {
                    signUp({ email, password, confirmPassword });
                  }
                }}
              />
              <Text fontSize="sm" color="text.muted" textAlign="left" mt={2}>
                Password must be at least 8 characters long.
              </Text>
            </FormControl>
            <FormControl id="confirmPassword">
              <FormLabel>Confirm password</FormLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && email && password.length >= 6) {
                    signUp({ email, password, confirmPassword });
                  }
                }}
              />
            </FormControl>

            <ChakraLink
              as={Link}
              to="/password/forgot"
              fontSize="sm"
              textAlign={{
                base: "center",
                sm: "right",
              }}
            >
              Forgot password?
            </ChakraLink>
            <Button
              my={2}
              isLoading={isPending}
              isDisabled={
                !email || password.length < 8 || password !== confirmPassword
              }
              onClick={() => signUp({ email, password, confirmPassword })}
            >
              Sign up
            </Button>
            <Text align="center" fontSize="sm" color="text.muted">
              Already have an account?{" "}
              <ChakraLink as={Link} to="/login">
                Login
              </ChakraLink>
            </Text>
          </Stack>
        </Box>
      </Container>
    </Flex>
  );
};
