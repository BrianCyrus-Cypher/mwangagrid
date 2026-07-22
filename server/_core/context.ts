import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { Request, Response, NextFunction } from "express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { sdk } from "./sdk";
import { parse as parseCookie } from "cookie";
import { COOKIE_NAME } from "@shared/const";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  const cookies = parseCookie(opts.req.headers.cookie ?? "");
  const sessionToken = cookies[COOKIE_NAME];

  if (sessionToken) {
    try {
      const session = await db.getSessionByToken(sessionToken);
      if (session) {
        user = (await db.getUserById(session.userId)) ?? null;
      }
    } catch (error) {
      console.warn("[Auth] Local session check failed", error);
    }
  }

  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch (error) {
      // Authentication is optional for public procedures.
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}

export async function requireExpressAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cookies = parseCookie(req.headers.cookie ?? "");
    const sessionToken = cookies[COOKIE_NAME];
    let user: User | null = null;

    if (sessionToken) {
      const session = await db.getSessionByToken(sessionToken);
      if (session) {
        user = (await db.getUserById(session.userId)) ?? null;
      }
    }

    if (!user) {
      user = await sdk.authenticateRequest(req);
    }

    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    (req as any).user = user;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}
