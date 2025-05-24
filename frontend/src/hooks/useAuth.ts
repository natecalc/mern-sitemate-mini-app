import { useQuery } from "@tanstack/react-query";
import { getUser } from "../lib/api";
import type { User } from "../types";

export const AUTH = "auth";

const useAuth = (opts = {}) => {
  const { data: user, ...rest } = useQuery<User>({
    queryKey: [AUTH],
    queryFn: getUser,
    staleTime: Infinity,
    ...opts,
  });
  return {
    user,
    ...rest,
  };
};

export default useAuth;
