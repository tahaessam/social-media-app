import jwt from "jsonwebtoken";

export const createGraphQLContext = async (req: any, _params: any) => {
  const authorization = req.headers?.authorization || req.headers?.Authorization;
  const token = typeof authorization === "string" ? authorization.replace("Bearer ", "") : undefined;

  if (!token) {
    return { user: null };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as Record<string, any>;
    return { user: { ...decoded, _id: decoded.userId } };
  } catch {
    return { user: null };
  }
};
