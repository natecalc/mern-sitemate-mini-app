import { Box, Button, Flex, Text } from "@chakra-ui/react";
import useDeleteSession from "../hooks/useDeleteSessions";

const SessionCard = (session: any) => {
  const { _id, createdAt, userAgent, isCurrent } = session;

  console.log("SessionCard received:", _id); // Add this line
  const { deleteSession, isPending } = useDeleteSession(_id as string);

  return (
    <Flex p={3} borderWidth="1px" borderRadius="md">
      <Box flex={1}>
        <Text fontWeight="bold" fontSize="sm" mb={1}>
          {new Date(createdAt).toLocaleString("en-US")}
          {isCurrent && " (current session)"}
        </Text>
        <Text color="gray.500" fontSize="xs">
          {userAgent}
        </Text>
      </Box>
      {!isCurrent && (
        <Button
          size="sm"
          variant="ghost"
          ml={4}
          alignSelf="center"
          fontSize="xl"
          color="red.400"
          title="Delete Session"
          onClick={() => deleteSession()}
          isLoading={isPending}
        >
          &times;
        </Button>
      )}
    </Flex>
  );
};
export default SessionCard;
