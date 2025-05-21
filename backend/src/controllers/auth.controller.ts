import { CREATED, OK } from "../constants/http";
import { createAccount, loginUser } from "../services/auth.service";
import catchErrors from "../utils/catchErrors";
import { setAuthCookies } from "../utils/cookies";
import { loginSchema, registerSchema } from "./auth.schemas";

export const registerHandler = catchErrors(async (req, res) => {
  const request = registerSchema.safeParse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  if (!request.success) {
    return res.status(400).json({
      status: "error",
      errors: request.error.errors,
    });
  }

  const { user, accessToken, refreshToken } = await createAccount(request.data);

  return setAuthCookies({
    res,
    accessToken,
    refreshToken,
  })
    .status(CREATED)
    .json(user);
});

export const loginHandler = catchErrors(async (req, res) => {
  const request = loginSchema.parse({
    ...req.body,
    userAgent: req.headers["user-agent"],
  });

  const { accessToken, refreshToken } = await loginUser(request);

  return setAuthCookies({
    res,
    accessToken,
    refreshToken,
  })
    .status(OK)
    .json({
      message: "Login successful",
    });
});
