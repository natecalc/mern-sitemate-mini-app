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
  Image,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { login } from "../lib/api";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const redirectUrl = location.state?.redirectUrl || "/";

  const {
    mutate: signIn, // anytime we call signIn, it will call the login function
    isError,
    isPending,
  } = useMutation({
    mutationFn: login,
    onSuccess: () => {
      navigate(redirectUrl, {
        replace: true,
      });
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
          Sign in to your account
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
                    signIn({ email, password });
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
              isDisabled={!email || password.length < 6}
              onClick={() => signIn({ email, password })}
            >
              Sign in
            </Button>
            <Text align="center" fontSize="sm" color="text.muted">
              Don&apos;t have an account?{" "}
              <ChakraLink as={Link} to="/register">
                Sign up
              </ChakraLink>
            </Text>
          </Stack>
        </Box>
        <Image
          src="/public/sitemate.svg"
          alt="Sitemate Logo"
          mt={8}
          maxW="200px"
          mx="auto"
        />
      </Container>
    </Flex>
  );
};
export default Login;
