# Canopy data model

The live application uses a Cloudflare D1 SQLite database. Drizzle owns schema changes; SQL queries use prepared statements. The source of truth is `db/schema.ts`, with generated migrations in `drizzle/`. There is no browser-local database. `lib/demo.ts` contains isolated, fictional, read-only sample content at `/preview`.

## Identities and access

| Table | Purpose and invariants |
| --- | --- |
| users | Unique normalized email, salted PBKDF2 password hash, name, bio, interests, explicit public-profile consent; role is member/admin and status is pending/active/suspended. |
| sessions | Only a SHA-256 token digest is stored; sessions expire after seven days. The browser receives an HttpOnly, SameSite=Lax cookie with Secure enabled on HTTPS. |
| connections | One canonical pair key for two members. The recipient must accept a pending request. |
| blocks | Composite key prevents duplicate blocks. A block in either direction prevents new connection requests and messages. |
| messages | Sender and recipient reference users; only those two participants receive message records. Accepted connections are required to send. |
| settings | The one-time administrator bootstrap is recorded atomically with promotion. A private runtime secret is required. |
| rate_limits | Fifteen-minute rate windows for registration, login, administrator setup, public contact, and member writes. |

New accounts are pending. Admins approve them. The admin setup key cannot be reused once initialization has succeeded. No account becomes administrator merely by claiming an email address. Registration does not yet verify email ownership; automatic verification and password-reset mail require an email service that has not been connected.

## Community content

| Table | Purpose and relationships |
| --- | --- |
| posts | A typed content record: discussion, idea, announcement, update, or testimonial. Optional project/stage references keep conversations in context. |
| comments | Replies reference a post and an author; parent-post access is checked before reading or writing. |
| idea_interests | One expression of interest per idea/member pair. |
| polls | One poll per post, with a required future deadline at creation. |
| poll_options | Two to six choices associated with a poll. |
| votes | One row per poll/member; changing a choice updates that row. The option must belong to that poll. Member-facing responses return aggregate counts and the caller’s own choice, not voter identities. |
| notifications | Per-user notices for connections, private messages, replies and project participation. |
| reports | Member-submitted reports for posts, members or messages; only admins can resolve them. |

Public notes require explicit submission by their author and administrator approval. Internal posts cannot be made public by ordinary members. Announcements are administrator-only. Unpublishing hides a post from other members and visitors, while retaining it for its author and administrators.

## Project collaboration

| Table | Purpose and relationships |
| --- | --- |
| projects | Goal, description, responsible owner, audience and current stage. |
| project_members | Unique project/member pair, role and membership status. Project leads approve requests or add existing active members. |
| project_stages | Ordered Planning, Recruiting, In progress and Completed stages. Stage transitions update the project and stage records together. |
| tasks | Belong to a project; may have an assignee, due date and stage. The assignee must be an active participant. Only the assignee, project lead or an admin can change status. |

Adopting an idea creates a project and links the original idea. Its author, replies and interest records remain intact. Project-scoped ideas can be attached to the current stage. The project summary can be public or member-visible while the work area remains participant-only.

## Events and public content

| Table | Purpose and relationships |
| --- | --- |
| events | Title, description, UTC start time, location and audience. Optional project link; the UI renders dates in the viewer’s local timezone. |
| rsvps | Unique event/member pair, so repeat clicks cannot duplicate registration. |
| partners | Confirmed partner names, descriptions and HTTPS links, maintained by administrators. |
| contacts | Private visitor inquiries; only admins can read or mark them handled. |

## Permission boundaries

- Public: published public posts, public events, public project summaries, partners, and opted-in profiles.
- Pending account: public content plus the account’s own status; no member data.
- Active member: member directory and member-visible content; personal connections, notifications, RSVPs, votes and messages.
- Project participant: project work area, including stages, tasks and project-only posts.
- Project lead: participant management, stage transitions and task creation within that project.
- Administrator: member review, official publication, moderation, visitor inquiries and project administration. The regular API does not expose other members’ direct messages to admins.

Authorization is enforced in the API and database queries, not only in navigation. Mutation requests require a matching Origin header. Queries bind parameters; user text is rendered through React rather than as raw HTML. Multi-row operations use D1 batches.

## Operational scope

The first release provides text conversations, direct messages with 30-second refresh while a member page is visible, one-choice polls, and local-time calendar views. It does not include attachments, group chat, push notifications, automated mail, end-to-end encryption, account export/deletion automation, or scheduled event reminders. The contact form supports manual account assistance. These are explicit boundaries, not mock controls.

The bootstrap API currently returns all records the caller may access; larger deployments should add cursor pagination and query-level audience filtering before high traffic. Server diagnostics report storage failures; failed forms retain their inputs. Database migrations are schema-only and contain no demo or test data.


## Audience-scoped reads

The website requests `/api?view=public`; the member area requests `/api?view=members`. Public reads return published announcements, official updates, approved notes, public events/projects and opted-in profiles even when the current session belongs to an administrator. The caller’s own session identity remains available for the member-entry link. Replies, polls, vote counts, messages, notifications, connections, RSVPs, tasks, stages, project membership and admin records are absent from the public payload. Anonymous and pending accounts receive the public scope regardless of the requested view.

Discussions and ideas cannot be submitted with public visibility, including by an administrator. Official publication is a separate announcement/update. The client keys its loaded snapshot by audience, so internal or sample content cannot carry across to a public route while a new request is pending. Out-of-order responses are ignored.
