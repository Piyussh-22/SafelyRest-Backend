// Creates a JWT token for a user with payload data and expiration settings for authentication.

import jwt, { SignOptions } from "jsonwebtoken";

export const signToken = (user: any): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"],
  };

  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      userType: user.userType,
    },
    process.env.JWT_SECRET as string,
    options,
  );
};
