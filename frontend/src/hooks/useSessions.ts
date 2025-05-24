import { useQuery } from "@tanstack/react-query";
import { getSessions } from "../lib/api";

export const SESSIONS = "sessions";

const useSessions = () => {
  const { data: sessions, ...rest } = useQuery({
    queryKey: [SESSIONS],
    queryFn: getSessions,
  });

  console.log("useSessions:", sessions);

  return { sessions, ...rest };
};
export default useSessions;
