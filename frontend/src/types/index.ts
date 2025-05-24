export type Session = {
  _id: string;
  userId: string;
  userAgent?: string;
  isCurrent?: boolean;
  createdAt: string;
  expiresAt: string;
};

export type User = {
  _id: string;
  email: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
};
