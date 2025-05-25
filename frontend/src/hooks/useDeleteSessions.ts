import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSession } from "../lib/api";
import { SESSIONS } from "./useSessions";

const useDeleteSession = (sessionId: string) => {
  const queryClient = useQueryClient();
  const { mutate, ...rest } = useMutation({
    mutationFn: () => deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SESSIONS] });
    },
  });

  return { deleteSession: mutate, ...rest };
};

export default useDeleteSession;
