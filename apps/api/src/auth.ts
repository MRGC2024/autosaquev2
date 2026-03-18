import type { Request, Response, NextFunction } from "express";

export function requireAdminToken(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.ADMIN_TOKEN_CHANGE_ME;
  if (!expected) {
    return res.status(500).json({ error: "ADMIN_TOKEN_CHANGE_ME não configurado" });
  }
  const got = req.header("x-admin-token");
  if (!got || got !== expected) {
    return res.status(401).json({ error: "Não autorizado" });
  }
  next();
}

