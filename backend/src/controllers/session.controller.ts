import { z } from "zod";
import { NOT_FOUND, OK } from "../constants/http";
import SessionModel from "../models/session.model";
import catchErrors from "../utils/catchErrors";
import appAssert from "../utils/appAssert";

export const getSessionsHandler = catchErrors(async (req, res) => {
  const sessions = await SessionModel.find(
    {
      userId: req.userId,
      expiresAt: { $gt: new Date() }, // Only get active sessions
    },
    {
      _id: 1, // set to 1 to include these field in the response
      userAgent: 1,
      createdAt: 1,
    },
    {
      sort: { createdAt: -1 }, // Sort by createdAt in descending order
    }
  );

  return res.status(OK).json({
    sessions: sessions.map((session) => ({
      ...session.toObject(),
      ...(session.id === req.sessionId && {
        isCurrent: true, // Add isCurrent field to the current session
      }),
    })),
  });
});

export const deleteSessionHandler = catchErrors(async (req, res) => {
  const sessionId = z.string().parse(req.params.id);
  const deleted = await SessionModel.findOneAndDelete({
    _id: sessionId,
    userId: req.userId,
  });
  appAssert(deleted, NOT_FOUND, "Session not found or already deleted");
  return res.status(OK).json({
    message: "Session removed",
  });
});
