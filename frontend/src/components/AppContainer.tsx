import { Box, Center, Spinner } from "@chakra-ui/react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import UserMenu from "./UserMenu";

const AppContainer = () => {
  const { user, isLoading } = useAuth();

  return isLoading ? (
    <Center w="100vw" h="90vh" flexDir="column">
      <Spinner mb={4} />
    </Center>
  ) : user ? (
    <Box p={4} minH="100vh">
      <UserMenu />
      {/* Outlet. All children rendered in AppContainer can assume the user has signed in as we have already handled the auth check above*/}
      <Outlet />
    </Box>
  ) : (
    <Navigate
      to="/login"
      replace
      state={{
        redirectUrl: window.location.pathname,
      }}
    />
  );
};
export default AppContainer;
