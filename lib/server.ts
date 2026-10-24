import { env } from "cloudflare:workers";
// Raw D1 records and request JSON are checked by the route validators before use.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;
export function database(): D1Database {
  const db = (env as unknown as { DB: D1Database }).DB;
  if (!db) throw new Error("Database is unavailable");
  return db;
}
export async function all(sql: string, ...args: unknown[]): Promise<Row[]> {
  return (
    await database()
      .prepare(sql)
      .bind(...args)
      .all<Row>()
  ).results;
}
export async function one(
  sql: string,
  ...args: unknown[]
): Promise<Row | null> {
  return database()
    .prepare(sql)
    .bind(...args)
    .first<Row>();
}
export async function run(sql: string, ...args: unknown[]) {
  return database()
    .prepare(sql)
    .bind(...args)
    .run();
}
export function stmt(sql: string, ...args: unknown[]) {
  return database()
    .prepare(sql)
    .bind(...args);
}
export const uid = () => crypto.randomUUID();
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const fail = (status: number, message: string): never => {
  throw new HttpError(status, message);
};
export function field(v: unknown, label: string, max = 4000, min = 1) {
  if (typeof v !== "string" || v.trim().length < min || v.trim().length > max)
    fail(400, `${label} must be ${min}–${max} characters.`);
  return (v as string).trim();
}
export function email(v: unknown) {
  const s = field(v, "Email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s))
    fail(400, "Enter a valid email address.");
  return s;
}
export function choice(v: unknown, options: string[], fallback?: string) {
  const s = typeof v === "string" ? v : fallback;
  if (!s || !options.includes(s)) fail(400, "Choose a valid option.");
  return s as string;
}
export async function hash(s: string) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)),
    ),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export async function passwordHash(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return Array.from(
    new Uint8Array(
      await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt: new TextEncoder().encode(salt),
          iterations: 100000,
          hash: "SHA-256",
        },
        key,
        256,
      ),
    ),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export async function currentUser(req: Request) {
  const token = req.headers
    .get("cookie")
    ?.match(/(?:^|;\s*)canopy_session=([^;]+)/)?.[1];
  if (!token) return null;
  return one(
    "SELECT u.id,u.email,u.name,u.role,u.status,u.bio,u.interests,u.public_profile FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>?",
    await hash(token),
    Date.now(),
  );
}
export function member(u: Row | null): Row {
  if (!u) fail(401, "Sign in to continue.");
  if (u!.status !== "active")
    fail(
      403,
      u!.status === "pending"
        ? "Your membership is waiting for approval."
        : "This account is suspended.",
    );
  return u!;
}
export function admin(u: Row | null) {
  const a = member(u);
  if (a.role !== "admin")
    fail(403, "This action is for Canopy administrators.");
  return a;
}
export async function visibleProject(p: Row, u: Row | null) {
  if (p.visibility === "public") return true;
  if (!u || u.status !== "active") return false;
  if (u.role === "admin" || p.owner_id === u.id) return true;
  return (
    p.visibility === "members" ||
    !!(await one(
      "SELECT 1 FROM project_members WHERE project_id=? AND user_id=? AND status='active'",
      p.id,
      u.id,
    ))
  );
}
export async function getProject(id: string, u: Row | null, manage = false) {
  const p = await one("SELECT * FROM projects WHERE id=?", id);
  if (!p || !(await visibleProject(p, u))) fail(404, "Project not found.");
  if (manage && u?.role !== "admin" && p!.owner_id !== u?.id)
    fail(403, "Only the project lead can make this change.");
  return p!;
}
export async function canSeePost(p: Row, u: Row | null) {
  if (!p.published && u?.role !== "admin" && p.author_id !== u?.id)
    return false;
  if (p.visibility === "public") return true;
  if (!u || u.status !== "active") return false;
  if (p.visibility === "members") return true;
  if (!p.project_id) return false;
  const project = await one("SELECT * FROM projects WHERE id=?", p.project_id);
  return (
    !!project &&
    (u.role === "admin" ||
      project.owner_id === u.id ||
      !!(await one(
        "SELECT 1 FROM project_members WHERE project_id=? AND user_id=? AND status='active'",
        p.project_id,
        u.id,
      )))
  );
}
export async function getPost(id: string, u: Row | null) {
  const p = await one("SELECT * FROM posts WHERE id=?", id);
  if (!p || !(await canSeePost(p, u))) fail(404, "Post not found.");
  return p!;
}
export async function rate(req: Request, label: string, limit = 15) {
  const ip = req.headers.get("cf-connecting-ip") || "local";
  const key = await hash(ip + ":" + label);
  const now = Date.now();
  const result = await one(
    "INSERT INTO rate_limits(key,count,reset_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN reset_at<? THEN 1 ELSE count+1 END,reset_at=CASE WHEN reset_at<? THEN ? ELSE reset_at END RETURNING count",
    key,
    now + 900000,
    now,
    now,
    now + 900000,
  );
  if (Number(result?.count) > limit)
    fail(429, "Too many attempts. Please try again in 15 minutes.");
}
export async function notify(userId: string, body: string, href: string) {
  await run(
    "INSERT INTO notifications(id,user_id,body,href) VALUES(?,?,?,?)",
    uid(),
    userId,
    body,
    href,
  );
}
export async function isBlocked(a: string, b: string) {
  return !!(await one(
    "SELECT 1 FROM blocks WHERE (user_id=? AND blocked_id=?) OR (user_id=? AND blocked_id=?)",
    a,
    b,
    b,
    a,
  ));
}
export async function session(userId: string, req: Request) {
  const token = uid() + uid();
  await run(
    "INSERT INTO sessions(id,user_id,expires_at) VALUES(?,?,?)",
    await hash(token),
    userId,
    Date.now() + 7 * 86400000,
  );
  return `canopy_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${new URL(req.url).protocol === "https:" ? "; Secure" : ""}`;
}
