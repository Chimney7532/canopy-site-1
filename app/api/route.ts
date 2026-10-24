import { env } from "cloudflare:workers";
import {
  all,
  one,
  run,
  stmt,
  database,
  uid,
  field,
  email,
  choice,
  hash,
  passwordHash,
  currentUser,
  member,
  admin,
  getProject,
  getPost,
  visibleProject,
  canSeePost,
  isBlocked,
  notify,
  session,
  rate,
  fail,
  HttpError,
  type Row,
} from "@/lib/server";
const reply = (data: unknown, status = 200, cookie?: string) =>
  Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...(cookie ? { "Set-Cookie": cookie } : {}),
    },
  });
function error(e: unknown) {
  if (e instanceof HttpError) return reply({ error: e.message }, e.status);
  console.error("Canopy request failed", e);
  return reply(
    {
      error:
        "Something went wrong. Your changes were not confirmed. Please try again.",
    },
    503,
  );
}
export async function GET(req: Request) {
  try {
    const u = await currentUser(req);
    const publicView = new URL(req.url).searchParams.get("view") === "public" || u?.status !== "active";
    const viewer = publicView ? null : u;
    const active = !publicView && u?.status === "active";
    const root = active && u?.role === "admin";
    const rawProjects = await all(
      "SELECT p.*,u.name AS owner_name FROM projects p JOIN users u ON u.id=p.owner_id ORDER BY p.created_at DESC",
    );
    const projects: Row[] = [];
    for (const p of rawProjects)
      if (await visibleProject(p, viewer)) projects.push(p);
    const rows = await all(
      "SELECT p.*,u.name AS author_name,(SELECT count(*) FROM comments c WHERE c.post_id=p.id) AS comment_count,(SELECT count(*) FROM idea_interests i WHERE i.post_id=p.id) AS interest_count FROM posts p JOIN users u ON u.id=p.author_id ORDER BY p.created_at DESC",
    );
    const posts: Row[] = [];
    for (const p of rows) {
      if (publicView && !["announcement", "update", "testimonial"].includes(p.kind)) continue;
      if (await canSeePost(p, viewer)) posts.push(publicView ? { ...p, comment_count: 0, interest_count: 0 } : p);
    }
    const postIds = new Set(posts.map((p) => p.id));
    const projectIds = new Set(
      projects
        .filter((p) => active && (root || p.owner_id === u!.id))
        .map((p) => p.id),
    );
    if (active) {
      for (const m of await all(
        "SELECT project_id FROM project_members WHERE user_id=? AND status='active'",
        u!.id,
      ))
        projectIds.add(m.project_id);
    }
    const events: Row[] = [];
    for (const e of await all("SELECT * FROM events ORDER BY starts_at"))
      if (
        e.visibility === "public" ||
        (active &&
          (e.visibility === "members" || root || projectIds.has(e.project_id)))
      )
        events.push(e);
    const comments = publicView ? [] : (
      await all(
        "SELECT c.*,u.name AS author_name FROM comments c JOIN users u ON u.id=c.author_id ORDER BY c.created_at",
      )
    ).filter((c) => postIds.has(c.post_id));
    const polls = publicView ? [] : (await all("SELECT * FROM polls")).filter((p) =>
      postIds.has(p.post_id),
    );
    const pollIds = new Set(polls.map((p) => p.id));
    const options = publicView ? [] : (
      await all(
        "SELECT o.*,(SELECT count(*) FROM votes v WHERE v.option_id=o.id) AS votes FROM poll_options o",
      )
    ).filter((o) => pollIds.has(o.poll_id));
    const people = await all(
      `SELECT id,name,bio,interests,public_profile FROM users WHERE status='active' ${active ? "" : "AND public_profile=1"} ORDER BY name`,
    );
    const result: Row = {
      user: u,
      people,
      projects,
      posts,
      comments,
      events,
      polls,
      options,
      partners: await all("SELECT * FROM partners"),
      stages: [],
      tasks: [],
      projectMembers: [],
      connections: [],
      messages: [],
      notifications: [],
      votes: [],
      rsvps: [],
      interested: [],
      blocks: [],
      admin: null,
    };
    if (active) {
      Object.assign(result, {
        stages: (
          await all("SELECT * FROM project_stages ORDER BY position")
        ).filter((s) => projectIds.has(s.project_id)),
        tasks: (await all("SELECT * FROM tasks")).filter((t) =>
          projectIds.has(t.project_id),
        ),
        projectMembers: (
          await all(
            "SELECT m.*,u.name FROM project_members m JOIN users u ON u.id=m.user_id",
          )
        ).filter((m) => projectIds.has(m.project_id) || m.user_id === u!.id),
        connections: await all(
          "SELECT * FROM connections WHERE requester_id=? OR recipient_id=?",
          u!.id,
          u!.id,
        ),
        messages: await all(
          "SELECT * FROM messages WHERE sender_id=? OR recipient_id=? ORDER BY created_at",
          u!.id,
          u!.id,
        ),
        notifications: await all(
          "SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 100",
          u!.id,
        ),
        votes: await all("SELECT * FROM votes WHERE user_id=?", u!.id),
        rsvps: await all("SELECT * FROM rsvps WHERE user_id=?", u!.id),
        interested: await all(
          "SELECT post_id FROM idea_interests WHERE user_id=?",
          u!.id,
        ),
        blocks: await all(
          "SELECT blocked_id FROM blocks WHERE user_id=?",
          u!.id,
        ),
      });
    }
    if (root)
      result.admin = {
        users: await all(
          "SELECT id,email,name,role,status,created_at FROM users ORDER BY created_at DESC",
        ),
        contacts: await all("SELECT * FROM contacts ORDER BY created_at DESC"),
        reports: await all("SELECT * FROM reports ORDER BY created_at DESC"),
        testimonials: await all(
          "SELECT p.*,u.name AS author_name FROM posts p JOIN users u ON u.id=p.author_id WHERE p.kind='testimonial'",
        ),
      };
    return reply(result);
  } catch (e) {
    return error(e);
  }
}
export async function POST(req: Request) {
  try {
    const origin = req.headers.get("origin");
    if (!origin || origin !== new URL(req.url).origin)
      fail(403, "This request must come from Canopy.");
    if (Number(req.headers.get("content-length") || 0) > 25000)
      fail(413, "This submission is too large.");
    const raw = await req.text();
    if (raw.length > 25000) fail(413, "This submission is too large.");
    let b: Row;
    try {
      b = JSON.parse(raw);
    } catch {
      fail(400, "Invalid request.");
    }
    if (!b! || typeof b !== "object" || Array.isArray(b!))
      fail(400, "Invalid request.");
    const action = field(b!.action, "Action", 40);
    const u = await currentUser(req);
    let result: Row = { ok: true };
    if (action === "register") {
      await rate(req, "register", 8);
      const address = email(b!.email),
        name = field(b!.name, "Name", 80),
        password = field(b!.password, "Password", 128, 12);
      if (await one("SELECT id FROM users WHERE email=?", address))
        fail(409, "An account already uses this email.");
      const id = uid(),
        salt = uid();
      await run(
        "INSERT INTO users(id,email,name,password_hash,salt) VALUES(?,?,?,?,?)",
        id,
        address,
        name,
        await passwordHash(password, salt),
        salt,
      );
      return reply({ ok: true }, 200, await session(id, req));
    }
    if (action === "signin") {
      await rate(req, "signin", 25);
      const address = email(b!.email),
        password = field(b!.password, "Password", 128);
      const user = await one("SELECT * FROM users WHERE email=?", address);
      const candidate = await passwordHash(
        password,
        user?.salt || "canopy-constant-time-salt",
      );
      if (!user || candidate !== user.password_hash)
        fail(401, "Email or password is incorrect.");
      if (user!.status === "suspended") fail(403, "This account is suspended.");
      return reply({ ok: true }, 200, await session(user!.id, req));
    }
    if (action === "signout") {
      const token = req.headers
        .get("cookie")
        ?.match(/(?:^|;\s*)canopy_session=([^;]+)/)?.[1];
      if (token)
        await run("DELETE FROM sessions WHERE id=?", await hash(token));
      return reply(
        { ok: true },
        200,
        "canopy_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
      );
    }
    if (action === "contact") {
      await rate(req, "contact", 8);
      await run(
        "INSERT INTO contacts(id,name,email,body) VALUES(?,?,?,?)",
        uid(),
        field(b!.name, "Name", 80),
        email(b!.email),
        field(b!.body, "Message"),
      );
      return reply(result);
    }
    if (action === "claimAdmin") {
      if (!u) fail(401, "Sign in first.");
      await rate(req, "admin-setup", 5);
      const key = (env as unknown as { CANOPY_SETUP_KEY?: string })
        .CANOPY_SETUP_KEY;
      if (
        !key ||
        (await hash(field(b!.key, "Setup key", 200))) !== (await hash(key))
      )
        fail(403, "The setup key is incorrect.");
      if (await one("SELECT 1 FROM settings WHERE key='admin_bootstrapped'"))
        fail(409, "An administrator has already been configured.");
      await database().batch([
        stmt(
          "INSERT INTO settings(key,value) VALUES('admin_bootstrapped',?)",
          u!.id,
        ),
        stmt("UPDATE users SET role='admin',status='active' WHERE id=?", u!.id),
      ]);
      return reply(result);
    }
    const actor = member(u);
    await rate(req, "member:" + actor.id, 150);
    if (action === "profile") {
      await run(
        "UPDATE users SET name=?,bio=?,interests=?,public_profile=? WHERE id=?",
        field(b!.name, "Name", 80),
        field(b!.bio || "", "Bio", 1200, 0),
        field(b!.interests || "", "Interests", 300, 0),
        b!.public_profile === true ? 1 : 0,
        actor.id,
      );
    } else if (action === "password") {
      const old = field(b!.current, "Current password", 128),
        next = field(b!.password, "New password", 128, 12);
      const user = await one("SELECT * FROM users WHERE id=?", actor.id);
      if ((await passwordHash(old, user!.salt)) !== user!.password_hash)
        fail(400, "Current password is incorrect.");
      const salt = uid();
      await database().batch([
        stmt(
          "UPDATE users SET password_hash=?,salt=? WHERE id=?",
          await passwordHash(next, salt),
          salt,
          actor.id,
        ),
        stmt("DELETE FROM sessions WHERE user_id=?", actor.id),
      ]);
      return reply(result, 200, await session(actor.id, req));
    } else if (action === "connect") {
      const target = field(b!.userId, "Member", 80);
      if (target === actor.id || (await isBlocked(actor.id, target)))
        fail(400, "This connection is unavailable.");
      if (
        !(await one(
          "SELECT 1 FROM users WHERE id=? AND status='active'",
          target,
        ))
      )
        fail(404, "Member not found.");
      const pair = [actor.id, target].sort().join(":");
      const existing = await one(
        "SELECT * FROM connections WHERE pair_key=?",
        pair,
      );
      if (existing) fail(409, "A connection request already exists.");
      await run(
        "INSERT INTO connections(id,requester_id,recipient_id,pair_key,note) VALUES(?,?,?,?,?)",
        uid(),
        actor.id,
        target,
        pair,
        field(b!.note || "", "Note", 300, 0),
      );
      await notify(
        target,
        `${actor.name} would like to connect.`,
        "/community/people",
      );
    } else if (action === "respondConnection") {
      const status = choice(b!.status, ["accepted", "declined"]);
      const c = await one(
        "SELECT * FROM connections WHERE id=? AND recipient_id=? AND status='pending'",
        b!.id,
        actor.id,
      );
      if (!c || (await isBlocked(actor.id, c.requester_id)))
        fail(404, "Request not found.");
      await run("UPDATE connections SET status=? WHERE id=?", status, c!.id);
      await notify(
        c!.requester_id,
        `${actor.name} ${status} your connection request.`,
        "/community/people",
      );
    } else if (action === "message") {
      const target = field(b!.userId, "Member", 80);
      if (
        (await isBlocked(actor.id, target)) ||
        !(await one(
          "SELECT 1 FROM connections WHERE pair_key=? AND status='accepted'",
          [actor.id, target].sort().join(":"),
        )) ||
        !(await one(
          "SELECT 1 FROM users WHERE id=? AND status='active'",
          target,
        ))
      )
        fail(403, "Messages are available between connected members.");
      await run(
        "INSERT INTO messages(id,sender_id,recipient_id,body) VALUES(?,?,?,?)",
        uid(),
        actor.id,
        target,
        field(b!.body, "Message"),
      );
      await notify(
        target,
        `New message from ${actor.name}.`,
        "/community/messages",
      );
    } else if (action === "block") {
      const target = field(b!.userId, "Member", 80);
      if (target === actor.id) fail(400, "Choose another member.");
      if (b!.remove)
        await run(
          "DELETE FROM blocks WHERE user_id=? AND blocked_id=?",
          actor.id,
          target,
        );
      else
        await run(
          "INSERT OR IGNORE INTO blocks(user_id,blocked_id) VALUES(?,?)",
          actor.id,
          target,
        );
    } else if (action === "post") {
      const kind = choice(b!.kind, [
        "discussion",
        "idea",
        "announcement",
        "update",
        "testimonial",
      ]);
      let visibility = choice(
        b!.visibility,
        ["public", "members", "project"],
        "members",
      );
      if (
        (kind === "announcement" || visibility === "public") &&
        kind !== "testimonial"
      )
        admin(actor);
      if (visibility === "public" && ["discussion", "idea"].includes(kind))
        fail(400, "Discussions and ideas stay in the member area. Publish an official update for the website.");
      let projectId: string | null = null,
        stageId: string | null = null;
      if (b!.projectId) {
        projectId = field(b!.projectId, "Project", 80);
        await getProject(projectId, actor, kind === "update");
        if (visibility === "project" && actor.role !== "admin") {
          const p = await getProject(projectId, actor);
          if (
            p.owner_id !== actor.id &&
            !(await one(
              "SELECT 1 FROM project_members WHERE project_id=? AND user_id=? AND status='active'",
              projectId,
              actor.id,
            ))
          )
            fail(403, "Join the project before posting here.");
        }
      }
      if (visibility === "project" && !projectId)
        fail(400, "Choose a project.");
      if (projectId && actor.role !== "admin") {
        const p = await getProject(projectId, actor);
        if (
          p.owner_id !== actor.id &&
          !(await one(
            "SELECT 1 FROM project_members WHERE project_id=? AND user_id=? AND status='active'",
            projectId,
            actor.id,
          ))
        )
          fail(403, "Join this project before posting.");
        visibility = "project";
      }
      if (b!.stageId) {
        stageId = field(b!.stageId, "Stage", 80);
        if (
          !(await one(
            "SELECT 1 FROM project_stages WHERE id=? AND project_id=?",
            stageId,
            projectId,
          ))
        )
          fail(400, "Invalid project stage.");
      }
      if (kind === "testimonial") visibility = "public";
      const id = uid();
      const batch = [
        stmt(
          "INSERT INTO posts(id,author_id,project_id,stage_id,kind,title,body,visibility,published) VALUES(?,?,?,?,?,?,?,?,?)",
          id,
          actor.id,
          projectId,
          stageId,
          kind,
          field(b!.title, "Title", 160),
          field(b!.body, "Text", 8000),
          visibility,
          kind === "testimonial" ? 0 : 1,
        ),
      ];
      if (b!.pollOptions) {
        if (
          !Array.isArray(b!.pollOptions) ||
          b!.pollOptions.length < 2 ||
          b!.pollOptions.length > 6
        )
          fail(400, "A poll needs 2–6 options.");
        const pollId = uid(),
          closes = field(b!.closesAt, "Closing date", 60);
        if (
          !Number.isFinite(Date.parse(closes)) ||
          Date.parse(closes) <= Date.now()
        )
          fail(400, "Choose a future closing date.");
        batch.push(
          stmt(
            "INSERT INTO polls(id,post_id,question,closes_at) VALUES(?,?,?,?)",
            pollId,
            id,
            field(b!.title, "Question", 160),
            new Date(closes).toISOString(),
          ),
        );
        for (const label of b!.pollOptions)
          batch.push(
            stmt(
              "INSERT INTO poll_options(id,poll_id,label) VALUES(?,?,?)",
              uid(),
              pollId,
              field(label, "Option", 100),
            ),
          );
      }
      await database().batch(batch);
      result = { ok: true, id };
    } else if (action === "comment") {
      const post = await getPost(field(b!.postId, "Post", 80), actor);
      await run(
        "INSERT INTO comments(id,post_id,author_id,body) VALUES(?,?,?,?)",
        uid(),
        post.id,
        actor.id,
        field(b!.body, "Reply"),
      );
      if (post.author_id !== actor.id)
        await notify(
          post.author_id,
          `${actor.name} replied to “${post.title}”.`,
          post.project_id
            ? `/community/build/${post.project_id}`
            : post.kind === "idea"
              ? "/community/build"
              : `/community/conversations?post=${post.id}`,
        );
    } else if (action === "interest") {
      const p = await getPost(field(b!.postId, "Idea", 80), actor);
      if (p.kind !== "idea") fail(400, "Choose an idea.");
      if (b!.remove)
        await run(
          "DELETE FROM idea_interests WHERE post_id=? AND user_id=?",
          p.id,
          actor.id,
        );
      else
        await run(
          "INSERT OR IGNORE INTO idea_interests(post_id,user_id) VALUES(?,?)",
          p.id,
          actor.id,
        );
    } else if (action === "vote") {
      const poll = await one("SELECT * FROM polls WHERE id=?", b!.pollId);
      if (!poll) fail(404, "Poll not found.");
      await getPost(poll!.post_id, actor);
      if (Date.parse(poll!.closes_at) <= Date.now())
        fail(400, "This poll has closed.");
      if (
        !(await one(
          "SELECT 1 FROM poll_options WHERE id=? AND poll_id=?",
          b!.optionId,
          poll!.id,
        ))
      )
        fail(400, "Invalid poll option.");
      await run(
        "INSERT INTO votes(poll_id,user_id,option_id) VALUES(?,?,?) ON CONFLICT(poll_id,user_id) DO UPDATE SET option_id=excluded.option_id",
        poll!.id,
        actor.id,
        b!.optionId,
      );
    } else if (action === "createProject") {
      const idea = b!.ideaId
        ? await getPost(field(b!.ideaId, "Idea", 80), actor)
        : null;
      if (idea && (idea.kind !== "idea" || idea.project_id))
        fail(400, "Choose an idea that has not been linked to a project.");
      if (idea && idea.author_id !== actor.id) admin(actor);
      const visibility = choice(
        b!.visibility,
        ["public", "members", "project"],
        "members",
      );
      if (visibility === "public") admin(actor);
      const id = uid();
      const batch = [
        stmt(
          "INSERT INTO projects(id,title,description,owner_id,visibility) VALUES(?,?,?,?,?)",
          id,
          field(b!.title, "Title", 160),
          field(b!.description, "Description", 8000),
          actor.id,
          visibility,
        ),
        stmt(
          "INSERT INTO project_members(project_id,user_id,role,status) VALUES(?,?,'lead','active')",
          id,
          actor.id,
        ),
      ];
      ["Planning", "Recruiting", "In progress", "Completed"].forEach(
        (name, i) =>
          batch.push(
            stmt(
              "INSERT INTO project_stages(id,project_id,name,position,status) VALUES(?,?,?,?,?)",
              uid(),
              id,
              name,
              i,
              i === 0 ? "current" : "upcoming",
            ),
          ),
      );
      if (idea)
        batch.push(
          stmt(
            "UPDATE posts SET project_id=?,status='adopted' WHERE id=?",
            id,
            idea.id,
          ),
        );
      await database().batch(batch);
      result = { ok: true, id };
    } else if (action === "joinProject") {
      const p = await getProject(field(b!.projectId, "Project", 80), actor);
      await run(
        "INSERT OR IGNORE INTO project_members(project_id,user_id,status) VALUES(?,?,'pending')",
        p.id,
        actor.id,
      );
      await notify(
        p.owner_id,
        `${actor.name} asked to join ${p.title}.`,
        `/community/build/${p.id}`,
      );
    } else if (action === "addProjectMember") {
      const p = await getProject(
        field(b!.projectId, "Project", 80),
        actor,
        true,
      );
      const target = field(b!.userId, "Member", 80);
      if (
        !(await one(
          "SELECT 1 FROM users WHERE id=? AND status='active'",
          target,
        ))
      )
        fail(404, "Member not found.");
      await run(
        "INSERT INTO project_members(project_id,user_id,role,status) VALUES(?,?,'participant','active') ON CONFLICT(project_id,user_id) DO UPDATE SET status='active'",
        p.id,
        target,
      );
      await notify(
        target,
        `${actor.name} added you to ${p.title}.`,
        `/community/build/${p.id}`,
      );
    } else if (action === "projectMember") {
      const p = await getProject(
        field(b!.projectId, "Project", 80),
        actor,
        true,
      );
      if (b!.userId === p.owner_id)
        fail(400, "The project lead cannot be removed.");
      await run(
        "UPDATE project_members SET status=? WHERE project_id=? AND user_id=?",
        choice(b!.status, ["active", "declined"]),
        p.id,
        field(b!.userId, "Member", 80),
      );
    } else if (action === "projectStage") {
      const p = await getProject(
        field(b!.projectId, "Project", 80),
        actor,
        true,
      );
      const stage = choice(b!.stage, [
        "Planning",
        "Recruiting",
        "In progress",
        "Completed",
      ]);
      const stages = await all(
        "SELECT * FROM project_stages WHERE project_id=? ORDER BY position",
        p.id,
      );
      const current = stages.find((s) => s.name === stage);
      await database().batch([
        stmt("UPDATE projects SET stage=? WHERE id=?", stage, p.id),
        ...stages.map((s) =>
          stmt(
            "UPDATE project_stages SET status=? WHERE id=?",
            s.position < current!.position
              ? "done"
              : s.id === current!.id
                ? "current"
                : "upcoming",
            s.id,
          ),
        ),
      ]);
    } else if (action === "ideaStatus") {
      const p = await getPost(field(b!.id, "Idea", 80), actor);
      if (p.kind !== "idea") fail(400, "Choose an idea.");
      if (p.project_id) await getProject(p.project_id, actor, true);
      else admin(actor);
      await run(
        "UPDATE posts SET status=? WHERE id=?",
        choice(b!.status, ["open", "reviewing", "adopted", "on-hold"]),
        p.id,
      );
    } else if (action === "task") {
      const p = await getProject(
        field(b!.projectId, "Project", 80),
        actor,
        true,
      );
      const assignee = b!.assigneeId || null;
      if (
        assignee &&
        !(await one(
          "SELECT 1 FROM project_members WHERE project_id=? AND user_id=? AND status='active'",
          p.id,
          assignee,
        ))
      )
        fail(400, "Assign tasks to a project member.");
      if (b!.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(b!.dueDate))
        fail(400, "Use a valid due date.");
      await run(
        "INSERT INTO tasks(id,project_id,title,assignee_id,due_date) VALUES(?,?,?,?,?)",
        uid(),
        p.id,
        field(b!.title, "Task", 200),
        assignee,
        b!.dueDate || null,
      );
    } else if (action === "taskStatus") {
      const t = await one("SELECT * FROM tasks WHERE id=?", b!.id);
      if (!t) fail(404, "Task not found.");
      const p = await getProject(t!.project_id, actor);
      if (
        t!.assignee_id !== actor.id &&
        p.owner_id !== actor.id &&
        actor.role !== "admin"
      )
        fail(403, "Only the assignee or project lead can update this task.");
      await run(
        "UPDATE tasks SET status=? WHERE id=?",
        choice(b!.status, ["todo", "doing", "done"]),
        t!.id,
      );
    } else if (action === "event") {
      admin(actor);
      const starts = field(b!.startsAt, "Date", 60);
      if (!Number.isFinite(Date.parse(starts)))
        fail(400, "Enter a valid date.");
      const visibility = choice(
        b!.visibility,
        ["public", "members", "project"],
        "public",
      );
      const projectId = b!.projectId || null;
      if (projectId) await getProject(projectId, actor);
      if (visibility === "project" && !projectId)
        fail(400, "Choose a project.");
      await run(
        "INSERT INTO events(id,title,description,starts_at,location,visibility,project_id,created_by) VALUES(?,?,?,?,?,?,?,?)",
        uid(),
        field(b!.title, "Title", 160),
        field(b!.description, "Description", 8000),
        new Date(starts).toISOString(),
        field(b!.location, "Location", 200),
        visibility,
        projectId,
        actor.id,
      );
    } else if (action === "rsvp") {
      const e = await one("SELECT * FROM events WHERE id=?", b!.eventId);
      if (!e) fail(404, "Event not found.");
      if (e!.visibility === "project") {
        const p = await getProject(e!.project_id, actor);
        if (
          p.owner_id !== actor.id &&
          actor.role !== "admin" &&
          !(await one(
            "SELECT 1 FROM project_members WHERE project_id=? AND user_id=? AND status='active'",
            p.id,
            actor.id,
          ))
        )
          fail(403, "This event is for project members.");
      }
      if (Date.parse(e!.starts_at) < Date.now())
        fail(400, "This event has already started.");
      if (b!.remove)
        await run(
          "DELETE FROM rsvps WHERE event_id=? AND user_id=?",
          e!.id,
          actor.id,
        );
      else
        await run(
          "INSERT OR IGNORE INTO rsvps(event_id,user_id) VALUES(?,?)",
          e!.id,
          actor.id,
        );
    } else if (action === "readNotifications")
      await run("UPDATE notifications SET read=1 WHERE user_id=?", actor.id);
    else if (action === "report") {
      await run(
        "INSERT INTO reports(id,reporter_id,target_type,target_id,reason) VALUES(?,?,?,?,?)",
        uid(),
        actor.id,
        choice(b!.targetType, ["post", "member", "message"]),
        field(b!.targetId, "Item", 80),
        field(b!.reason, "Reason", 2000),
      );
    } else if (action === "memberStatus") {
      admin(actor);
      if (b!.id === actor.id)
        fail(400, "You cannot change your own membership status.");
      if (await one("SELECT 1 FROM users WHERE id=? AND role='admin'", b!.id))
        fail(403, "Administrator status cannot be changed here.");
      const status = choice(b!.status, ["active", "pending", "suspended"]);
      await database().batch([
        stmt(
          "UPDATE users SET status=? WHERE id=?",
          status,
          field(b!.id, "Member", 80),
        ),
        ...(status !== "active"
          ? [stmt("DELETE FROM sessions WHERE user_id=?", b!.id)]
          : []),
      ]);
    } else if (action === "moderatePost") {
      admin(actor);
      await run(
        "UPDATE posts SET published=? WHERE id=?",
        b!.published === true ? 1 : 0,
        field(b!.id, "Post", 80),
      );
    } else if (action === "resolveReport") {
      admin(actor);
      await run(
        "UPDATE reports SET status='resolved' WHERE id=?",
        field(b!.id, "Report", 80),
      );
    } else if (action === "contactStatus") {
      admin(actor);
      await run(
        "UPDATE contacts SET status='handled' WHERE id=?",
        field(b!.id, "Message", 80),
      );
    } else if (action === "partner") {
      admin(actor);
      const url = field(b!.url, "Website", 1000);
      if (!/^https:\/\//.test(url)) fail(400, "Use an HTTPS website address.");
      await run(
        "INSERT INTO partners(id,name,description,url) VALUES(?,?,?,?)",
        uid(),
        field(b!.name, "Name", 100),
        field(b!.description, "Description", 1000),
        url,
      );
    } else fail(400, "Unknown action.");
    return reply(result);
  } catch (e) {
    return error(e);
  }
}
