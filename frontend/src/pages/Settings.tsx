import { Container, Heading, Spinner, Text, VStack } from "@chakra-ui/react";
import useSessions from "../hooks/useSessions";
import SessionCard from "../components/SessionsCard";
import type { Session } from "../types";

const Settings = () => {
  const { sessions, isPending, isSuccess, isError } = useSessions();
  return (
    <Container mt={16}>
      <Heading mb={6}>My Sessions</Heading>
      {isPending && <Spinner />}
      {isError && <Text color="red.400">Failed to get sessions.</Text>}
      {isSuccess && sessions && (
        <VStack spacing={3} align="flex-start">
          {sessions &&
            sessions.map((session: Session) => (
              <SessionCard key={session._id} session={session} />
            ))}
        </VStack>
      )}
    </Container>
  );
};
export default Settings;
