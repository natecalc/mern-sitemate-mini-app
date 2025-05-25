import { useQuery } from "@tanstack/react-query";
import { getSessions } from "../lib/api";
import type { Session } from "../types";

export const SESSIONS = "sessions";

const useSessions = () => {
  const { data, ...rest } = useQuery({
    queryKey: [SESSIONS],
    queryFn: getSessions,
    staleTime: 1000 * 60 * 5,
    notifyOnChangeProps: "all",
  });

  return { sessions: data?.sessions as Session[], ...rest };
};
export default useSessions;
