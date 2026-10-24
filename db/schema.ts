import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  index,
  real,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
const id = () => text("id").primaryKey();
const created = () =>
  text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`);
export const users = sqliteTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  salt: text("salt").notNull(),
  role: text("role", { enum: ["member", "admin"] })
    .notNull()
    .default("member"),
  status: text("status", { enum: ["pending", "active", "suspended"] })
    .notNull()
    .default("pending"),
  bio: text("bio").notNull().default(""),
  interests: text("interests").notNull().default(""),
  publicProfile: integer("public_profile").notNull().default(0),
  createdAt: created(),
});
export const sessions = sqliteTable(
  "sessions",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at").notNull(),
  },
  (t) => [index("session_user").on(t.userId)],
);
export const connections = sqliteTable("connections", {
  id: id(),
  requesterId: text("requester_id")
    .notNull()
    .references(() => users.id),
  recipientId: text("recipient_id")
    .notNull()
    .references(() => users.id),
  pairKey: text("pair_key").notNull().unique(),
  status: text("status", { enum: ["pending", "accepted", "declined"] })
    .notNull()
    .default("pending"),
  note: text("note").notNull().default(""),
  createdAt: created(),
});
export const blocks = sqliteTable(
  "blocks",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    blockedId: text("blocked_id")
      .notNull()
      .references(() => users.id),
  },
  (t) => [primaryKey({ columns: [t.userId, t.blockedId] })],
);
export const messages = sqliteTable(
  "messages",
  {
    id: id(),
    senderId: text("sender_id")
      .notNull()
      .references(() => users.id),
    recipientId: text("recipient_id")
      .notNull()
      .references(() => users.id),
    body: text("body").notNull(),
    createdAt: created(),
  },
  (t) => [index("message_recipient").on(t.recipientId, t.createdAt)],
);
export const projects = sqliteTable("projects", {
  id: id(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id),
  visibility: text("visibility", { enum: ["public", "members", "project"] })
    .notNull()
    .default("members"),
  stage: text("stage").notNull().default("Planning"),
  createdAt: created(),
});
export const projectMembers = sqliteTable(
  "project_members",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    role: text("role").notNull().default("participant"),
    status: text("status").notNull().default("pending"),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.userId] })],
);
export const stages = sqliteTable("project_stages", {
  id: id(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  position: integer("position").notNull(),
  dueDate: text("due_date"),
  status: text("status").notNull().default("upcoming"),
});
export const posts = sqliteTable(
  "posts",
  {
    id: id(),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id),
    projectId: text("project_id").references(() => projects.id),
    stageId: text("stage_id").references(() => stages.id),
    kind: text("kind", {
      enum: ["discussion", "idea", "announcement", "update", "testimonial"],
    }).notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    visibility: text("visibility", { enum: ["public", "members", "project"] })
      .notNull()
      .default("members"),
    status: text("status").notNull().default("open"),
    published: integer("published").notNull().default(1),
    createdAt: created(),
  },
  (t) => [index("post_feed").on(t.kind, t.visibility, t.createdAt)],
);
export const comments = sqliteTable("comments", {
  id: id(),
  postId: text("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id),
  body: text("body").notNull(),
  createdAt: created(),
});
export const interests = sqliteTable(
  "idea_interests",
  {
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
  },
  (t) => [primaryKey({ columns: [t.postId, t.userId] })],
);
export const polls = sqliteTable("polls", {
  id: id(),
  postId: text("post_id")
    .notNull()
    .unique()
    .references(() => posts.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  closesAt: text("closes_at").notNull(),
});
export const pollOptions = sqliteTable("poll_options", {
  id: id(),
  pollId: text("poll_id")
    .notNull()
    .references(() => polls.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
});
export const votes = sqliteTable(
  "votes",
  {
    pollId: text("poll_id")
      .notNull()
      .references(() => polls.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    optionId: text("option_id")
      .notNull()
      .references(() => pollOptions.id),
  },
  (t) => [primaryKey({ columns: [t.pollId, t.userId] })],
);
export const tasks = sqliteTable("tasks", {
  id: id(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id),
  stageId: text("stage_id").references(() => stages.id),
  title: text("title").notNull(),
  assigneeId: text("assignee_id").references(() => users.id),
  dueDate: text("due_date"),
  status: text("status").notNull().default("todo"),
});
export const events = sqliteTable("events", {
  id: id(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startsAt: text("starts_at").notNull(),
  location: text("location").notNull(),
  visibility: text("visibility", { enum: ["public", "members", "project"] })
    .notNull()
    .default("public"),
  projectId: text("project_id").references(() => projects.id),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: created(),
});
export const rsvps = sqliteTable(
  "rsvps",
  {
    eventId: text("event_id")
      .notNull()
      .references(() => events.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.userId] })],
);
export const notifications = sqliteTable("notifications", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  body: text("body").notNull(),
  href: text("href").notNull(),
  read: integer("read").notNull().default(0),
  createdAt: created(),
});
export const partners = sqliteTable("partners", {
  id: id(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  url: text("url").notNull(),
});
export const contacts = sqliteTable("contacts", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: created(),
});
export const reports = sqliteTable("reports", {
  id: id(),
  reporterId: text("reporter_id")
    .notNull()
    .references(() => users.id),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("open"),
  createdAt: created(),
});
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
export const rateLimits = sqliteTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  resetAt: integer("reset_at").notNull(),
});

// Additive tables for the current public site and member tools.
export const joinApplications = sqliteTable("join_applications", {
 id:id(), requestId:text("request_id").notNull().unique(), name:text("name").notNull(), email:text("email").notNull(),
 organization:text("organization").notNull().default(""), introduction:text("introduction").notNull().default(""),
 status:text("status").notNull().default("new"), createdAt:text("created_at").notNull(), profileJson:text("profile_json").notNull().default("{}")
},t=>[index("join_applications_created").on(t.createdAt)]);
export const forumMeta = sqliteTable("forum_meta", {
 postId:text("post_id").primaryKey().references(()=>posts.id), board:text("board").notNull().default("ideas"),
 pinned:integer("pinned").notNull().default(0), locked:integer("locked").notNull().default(0), deleted:integer("deleted").notNull().default(0),
 updatedAt:text("updated_at").notNull(), revision:integer("revision").notNull().default(1)
});
export const forumReplyMeta = sqliteTable("forum_reply_meta", {
 commentId:text("comment_id").primaryKey().references(()=>comments.id), parentId:text("parent_id").references(()=>comments.id),
 deleted:integer("deleted").notNull().default(0), editedAt:text("edited_at")
});
export const forumSaved = sqliteTable("forum_saved", {userId:text("user_id").references(()=>users.id),postId:text("post_id").references(()=>posts.id)},t=>[primaryKey({columns:[t.userId,t.postId]})]);
export const forumLikes = sqliteTable("forum_likes", {userId:text("user_id").references(()=>users.id),postId:text("post_id").references(()=>posts.id)},t=>[primaryKey({columns:[t.userId,t.postId]})]);
export const forumFollowers = sqliteTable("forum_followers", {userId:text("user_id").references(()=>users.id),postId:text("post_id").references(()=>posts.id)},t=>[primaryKey({columns:[t.userId,t.postId]})]);
export const siteEvents = sqliteTable("site_events", {
 id:id(), date:text("date").notNull(), title:text("title").notNull(), description:text("description"), url:text("url"), imageUrl:text("image_url"),
 imageX:real("image_x").notNull().default(50),imageY:real("image_y").notNull().default(50),
 status:text("status",{enum:["draft","published","archived"]}).notNull().default("draft"),
 isSample:integer("is_sample").notNull().default(0),revision:integer("revision").notNull().default(1),
 createdAt:text("created_at").notNull(),updatedAt:text("updated_at").notNull(),detailsJson:text("details_json").notNull().default("{}")
},t=>[index("site_events_date").on(t.status,t.date)]);
