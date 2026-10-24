"use client";
/* eslint-disable @next/next/no-img-element -- Local SVG identity and a pre-sized static photograph need no image optimizer. */
/* eslint-disable @next/next/no-html-link-for-pages -- Document navigation avoids a production RSC routing failure in the current runtime. */
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { BrandWord } from "@/components/brand-word";
import { useChapterScroll } from "@/hooks/use-chapter-scroll";
import { usePathname } from "next/navigation";
import { usePageNavigation } from "@/hooks/use-page-navigation";
import {
  Leaf,
  Plus,
  MessageSquare,
  Layers,
  Bell,
  Search,
  Check,
  Heart,
  LogOut,
  MapPin,
  Flag,
  Lock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { demo as sample } from "@/lib/demo";
// D1 JSON records are validated at the API boundary; individual views select their record fields.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type R = Record<string, any>;
const useNow = () => useState(() => Date.now())[0];
type Ctx = {
  data: R;
  path: string;
  search: string;
  loading: boolean;
  error: string;
  preview: boolean;
  community: boolean;
  base: string;
  refresh: () => Promise<void>;
  act: (action: string, body?: R) => Promise<R>;
};
const AppContext = createContext<Ctx>(null!);
const useApp = () => useContext(AppContext);
const empty: R = {
  user: null,
  people: [],
  posts: [],
  comments: [],
  projects: [],
  events: [],
  partners: [],
  polls: [],
  options: [],
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
function Brand() {
  return (
    <a href="/" className="brand" aria-label="Canopy home">
      <img src="/canopy-logo.svg" alt="CANOPY" width={726} height={166} />
    </a>
  );
}
function PublicationDate() {
  const [date] = useState(() => new Date());
  return (
    <time
      className="edition-date"
      dateTime={date.toISOString().slice(0, 10)}
      suppressHydrationWarning
    >
      {date.toLocaleDateString("en-GB").replaceAll("/", ".")}
    </time>
  );
}
function FeedChapter({
  word,
  label,
  first = false,
  children,
}: {
  word: string;
  label: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  const Heading = first ? "h1" : "h2";
  return (
    <section
      className={"feed-chapter" + (first ? " feed-chapter-first" : "")}
      aria-label={first ? "Canopy" : "Can " + word.toLowerCase()}
    >
      <header className="chapter-heading">
        <Heading
          className="chapter-word"
          aria-label={first ? "Canopy" : "Can " + word.toLowerCase()}
        >
          <BrandWord word={word} />
        </Heading>
        <div className="chapter-caption">
          <span>{label}</span>
          {first && <PublicationDate />}
        </div>
      </header>
      <div className="chapter-body">{children}</div>
    </section>
  );
}
function PublicationFrame({ children, memberView = false }: { children: React.ReactNode; memberView?: boolean }) {
  const { data, base, preview, loading, act } = useApp();
  const { path, search } = useApp();
  const isHome = !memberView && path === "/";
  const readingRef = useRef<HTMLElement>(null);
  useChapterScroll(readingRef, isHome && !loading, [data.events.length, data.projects.length, data.posts.length, data.people.length].join(":"));
  const nav = memberView ? [
    ["Discussions", base], ["Ideas & projects", base + "/build"],
    ["Members", base + "/people"], ["Calendar", base + "/events"],
  ] : [["Home", "/"], ["What’s on", "/events"], ["Projects", "/explore"], ["People", "/people"], ["About", "/about"]];
  return <SidebarProvider
    className={"publication calm-publication " + (memberView ? "publication-members" : "publication-website")}
    style={{ "--sidebar-width": "180px" } as React.CSSProperties}
  >
    <Sidebar className="publication-nav">
      <SidebarHeader className={"mobile-brand" + (memberView ? " member-navigation" : "")}><Brand /></SidebarHeader>
      <SidebarContent className={memberView ? "member-navigation" : undefined}>
        <div className="nav-edition-label">{memberView ? "MEMBER AREA" : "CANOPY"}</div>
        <SidebarMenu>{nav.map(([label, href]) => <SidebarMenuItem key={href}>
          <SidebarMenuButton asChild isActive={path === href || (href !== "/" && href !== base && path?.startsWith(href + "/")) || (memberView && href === base && path === base + "/conversations")}>
            <a href={href} className="canopy-nav-link">
              <span className="nav-label">{label}</span>
              <span className="nav-marker" aria-hidden="true">
                {[0, 1].map(copy => <svg key={copy} className={"nav-arrow nav-arrow-" + (copy ? "next" : "current")} viewBox="0 0 24 24" fill="none" focusable="false">
                  <path d="M4 20L20 4M10 4H20V14" />
                </svg>)}
              </span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>)}</SidebarMenu>
        <div className="publication-nav-secondary">{memberView ? <>
          <a href={base + "/messages"}>Messages</a>
          <a href={base + "/notifications"}>Notifications {data.notifications.filter((n: R) => !n.read).length > 0 && <sup>{data.notifications.filter((n: R) => !n.read).length}</sup>}</a>
          <a href={base + "/settings"}>Your profile</a>
          {(preview || data.user?.role === "admin") && <a href={base + "/admin"}>Admin</a>}
        </> : <><a href="/updates">From Canopy</a><a href="/contact">Get in touch</a></>}</div>
        {!memberView && <div className="nav-main-action"><a href="/join">Join Canopy <Plus size={16}/></a></div>}
      </SidebarContent>
      <SidebarFooter className={memberView ? "member-navigation" : undefined}>
        <Brand />
        {memberView ? <div className="nav-account"><span>{data.user?.name}</span><button aria-label="Sign out" onClick={async () => { if (!preview) await act("signout"); window.location.assign("/"); }}><LogOut size={16}/></button></div> : <span className="nav-colophon">© {new Date().getFullYear()} Canopy</span>}
      </SidebarFooter>
    </Sidebar>
    <SidebarInset className={"publication-surface " + (isHome ? "public-home-surface" : memberView ? "member-workspace" : "public-page-surface")}>
      <div className="mobile-bar"><SidebarTrigger/><Brand/><a href={memberView ? base + "/messages" : "/join"}>{memberView ? "Messages" : "Join"}</a></div>
      <div className="edition-context"><span>{memberView ? <><Lock size={12}/> Members</> : "A place for people and projects"}</span><a href={memberView ? "/" : data.user ? "/community" : "/signin"}>{memberView ? "Public website ↗" : data.user ? "Member area ↗" : "Member sign in ↗"}</a></div>
      {preview && <div className="preview-banner"><span>Member area preview · sample content · read only</span><a href="/preview/guide">Browse all pages</a></div>}
      <div className={isHome ? "public-story" : "quiet-edition"}>
        <main ref={readingRef} id="main-content" className={"editorial-content page-" + (memberView ? (path?.slice(base.length).split("/")[1] || "discussions") : (path?.split("/")[1] || "home"))}>
          {isHome && <div className="public-can-anchor" aria-hidden="true"><span className="chapter-word chapter-can"><BrandWord word="CAN"/></span></div>}
          <div className="reading-flow" key={path + "?" + search}>{children}{!memberView && <Footer/>}</div>
        </main>
      </div>
    </SidebarInset>
  </SidebarProvider>;
}

function Avatar({ name, size = "" }: { name: string; size?: string }) {
  return (
    <span className={"avatar " + size} aria-hidden="true">
      {name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}
function Pill({ children }: { children: React.ReactNode }) {
  return <span className="pill">{children}</span>;
}
function Empty({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}
function Field({
  label,
  name,
  type = "text",
  required = true,
  defaultValue,
  placeholder,
  maxLength = 4000,
  children,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  maxLength?: number;
  children?: React.ReactNode;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children ||
        (type === "textarea" ? (
          <textarea
            name={name}
            required={required}
            defaultValue={defaultValue}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={4}
          />
        ) : (
          <input
            name={name}
            type={type}
            required={required}
            defaultValue={defaultValue}
            placeholder={placeholder}
            maxLength={maxLength}
            minLength={type === "password" ? 12 : undefined}
          />
        ))}
    </label>
  );
}
function Pick({
  name,
  options,
  defaultValue,
  placeholder = "Choose an option",
}: {
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <Select name={name} defaultValue={defaultValue}>
      <SelectTrigger className="w-full h-11">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem value={o.value} key={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function Form({
  children,
  onSubmit,
  submit = "Save changes",
  onDone,
}: {
  children: React.ReactNode;
  onSubmit: (v: R) => Promise<unknown>;
  submit?: string;
  onDone?: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        const form = e.currentTarget;
        const values = Object.fromEntries(new FormData(form));
        setBusy(true);
        setError("");
        try {
          await onSubmit(values);
          onDone?.();
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      {children}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="button dark" disabled={busy} type="submit">
        {busy ? "Saving…" : submit}
      </button>
    </form>
  );
}
function Modal({
  title,
  description,
  trigger,
  children,
}: {
  title: string;
  description?: string;
  trigger: React.ReactNode;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description || " "}</DialogDescription>
        </DialogHeader>
        {children(() => setOpen(false))}
      </DialogContent>
    </Dialog>
  );
}
function Action({
  action,
  body,
  children,
  className = "button",
  success,
}: {
  action: string;
  body?: R;
  children: React.ReactNode;
  className?: string;
  success?: string;
}) {
  const { act } = useApp();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className={className}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await act(action, body);
          if (success) toast.success(success);
        } catch (e) {
          toast.error((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? "Please wait…" : children}
    </button>
  );
}
function Footer() {
  return (
    <footer>
      <Brand />
      <div className="footer-links">
        <a href="/contact">Get in touch</a>
        <a href="/community">Member area</a>
        <a href="/privacy">Privacy & community rules</a>
      </div>
      <span>© {new Date().getFullYear()} Canopy</span>
    </footer>
  );
}
function PageHead({
  label,
  title,
  text,
  action,
}: {
  label?: string;
  title: string;
  text?: string;
  action?: React.ReactNode;
}) {
  const { path } = useApp();
  const display = ({
    "/events": ["WHAT'S ON", "What’s on"],
    "/explore": ["PROJECTS", "Projects"],
    "/people": ["PEOPLE", "People"],
    "/about": ["ABOUT", "About Canopy"],
    "/updates": ["NEWS", "From Canopy"],
    "/contact": ["HELLO", "Get in touch"],
  } as Record<string, [string, string]>)[path];
  return (
    <div className={"page-heading" + (display ? " public-display-heading" : "")}>
      <div>
        {label && !display && <span className="small-label">{label}</span>}
        <h1 aria-label={display?.[1]}>{display ? <BrandWord word={display[0]}/> : title}</h1>
        {(text || (display && title !== display[1])) && <p>{text || title}</p>}
      </div>
      {action}
    </div>
  );
}

function PublicPost({ post }: { post: R }) {
  return <article className="public-post">
    <div className="article-kicker"><span>FROM CANOPY</span><time>{post.created_at.slice(0, 10)}</time></div>
    <h3>{post.title}</h3>
    <p className="preserve">{post.body}</p>
  </article>;
}
function ChapterInvitation({title, text, href, action}: {title: string; text: string; href: string; action: string}) {
  return <div className="chapter-invitation"><h2>{title}</h2><div><p>{text}</p><a className="button dark" href={href}>{action}</a></div></div>;
}
function PublicHome() {
  const { data } = useApp();
  const now = useNow();
  const events = data.events.filter((e: R) => e.visibility === "public" && Date.parse(e.starts_at) >= now).sort((a: R, b: R) => Date.parse(a.starts_at) - Date.parse(b.starts_at));
  const projects = data.projects.filter((p: R) => p.visibility === "public");
  const announcements = data.posts.filter((p: R) => p.visibility === "public" && ["announcement", "update"].includes(p.kind));
  const people = data.people.filter((p: R) => p.public_profile);
  const notes = data.posts.filter((p: R) => p.visibility === "public" && p.kind === "testimonial");
  return <>
    <FeedChapter word="OPY" label="" first>
      <img className="public-mobile-logo" src="/canopy-logo.svg" alt="Canopy" width={726} height={166}/>
      <div className="public-intro">
        <img className="public-hero-photo" src="/canopy.jpg" alt="Sunlight through a tree canopy" width={2400} height={1800} fetchPriority="high"/>
        <div className="public-intro-copy">
          <h2>Come along.</h2>
          <div className="public-intro-details">
            <p>Meet people at an event, bring an idea, or join a project.</p>
            <a className="button public-primary" href="/events">See what’s on</a>
          </div>
        </div>
      </div>
    </FeedChapter>
    <FeedChapter word="JOIN" label="What’s on">
      {events.length > 0 ? <div className="featured-event"><EventRow event={events[0]}/></div> : <ChapterInvitation title="Make time to meet." text="The next dates haven’t been announced yet. Have an event in mind? Tell us what you’d like to host." href="/contact" action="Suggest an event"/>}
      {events.slice(1, 3).map((event: R) => <EventRow key={event.id} event={event}/>)}
      <a className="quiet-section-link" href="/events">View the calendar ↗</a>
    </FeedChapter>
    <FeedChapter word="BUILD" label="Projects taking shape">
      {!projects.length && <ChapterInvitation title="Bring your idea." text="Start with a suggestion. Find people who want to help, then work out the next steps together." href="/community/build" action="Explore ideas & projects"/>}
      <div className="public-projects">{projects.slice(0, 2).map((p: R) => <article key={p.id}>
        <span className="project-phase">{p.stage}</span><h2>{p.title}</h2><p>{p.description}</p>
        <a className="underlined" href={"/explore/" + p.id}>View project</a>
      </article>)}</div>
    </FeedChapter>
    <FeedChapter word="READ" label="Around Canopy">
      {!announcements.length && !people.length && !notes.length && <ChapterInvitation title="Get to know Canopy." text="Official updates, member introductions and notes from the community live here." href="/about" action="About Canopy"/>}
      {people.length > 0 && <section className="public-people"><div className="calm-section-head"><h2>The people here.</h2><a href="/people">Meet everyone ↗</a></div><div className="public-people-list">{people.slice(0, 3).map((p: R) => <article key={p.id}><Avatar name={p.name} size="large"/><h3>{p.name}</h3><p>{p.bio}</p></article>)}</div></section>}
      {notes.slice(0, 1).map((p: R) => <blockquote className="member-note" key={p.id}><p>“{p.body}”</p><cite>{p.author_name}</cite></blockquote>)}
      {announcements.slice(0, 2).map((p: R) => <PublicPost key={p.id} post={p}/>)}
      <div className="chapter-links"><a href="/updates">From Canopy</a><a href="/people">Meet the members</a></div>
    </FeedChapter>
    <div className="public-closing">
      {data.partners.length > 0 && <section className="public-partners"><h2>Working with Canopy</h2><div>{data.partners.map((p: R) => <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer">{p.name} ↗</a>)}</div></section>}
      <div className="public-contact"><h2>Have something in mind?</h2><a href="/contact">Write to Canopy ↗</a></div>
    </div>
  </>;
}
function PublicAbout() {
  const { data } = useApp();
  return (
    <>
      <PageHead
        label="ABOUT CANOPY"
        title="A community you can take part in."
      />
      <div className="about-grid">
        <div
          className="about-photo"
          role="img"
          aria-label="Sunlight through a green tree canopy"
        />
        <div className="prose">
          <h2>It starts with showing up.</h2>
          <p>
            Canopy is a place to meet people, take part in events, and work on
            projects with other members.
          </p>
          <p>
            You can come with an idea or join something that’s already underway.
            The community gives you a place to talk through the details and find
            people who want to help.
          </p>
          <a href="/join" className="button dark">
            Join Canopy
          </a>
        </div>
      </div>
      <section className="section" id="partners">
        <h2>Our partners</h2>
        {data.partners.length ? (
          <div className="card-grid">
            {data.partners.map((p: R) => (
              <a
                className="content-card"
                href={p.url}
                key={p.id}
                rel="noopener noreferrer"
                target="_blank"
              >
                <h3>{p.name}</h3>
                <p>{p.description}</p>
              </a>
            ))}
          </div>
        ) : (
          <div className="quiet-panel">
            <p>Interested in working with Canopy?</p>
            <a href="/contact" className="button">
              Get in touch
            </a>
          </div>
        )}
      </section>
    </>
  );
}
function AuthPage({ join = false }: { join?: boolean }) {
  const { act, data } = useApp();
  return (
    <div className="auth-grid">
      <div className="auth-copy">
        <span className="small-label">CANOPY / MEMBERS</span>
        <h1>{join ? "Come on in." : "Welcome back."}</h1>
        <p>
          {join
            ? "Apply for access to member discussions, ideas and shared projects. Canopy reviews each application."
            : "Your discussions, ideas and projects are in the member area."}
        </p>
        <div className="auth-image" />
      </div>
      <div className="auth-form">
        <h2>{join ? "Join Canopy" : "Sign in"}</h2>
        {data.user ? (
          <>
            <p>You’re signed in as {data.user.name}.</p>
            <a className="button dark" href="/community">
              Go to community
            </a>
          </>
        ) : (
          <>
            <Form
              submit={join ? "Create your account" : "Sign in"}
              onSubmit={async (v) => {
                await act(join ? "register" : "signin", v);
                window.location.assign("/community");
              }}
            >
              {join && <Field label="Your name" name="name" maxLength={80} />}
              <Field label="Email" name="email" type="email" maxLength={254} />
              <Field
                label={join ? "Password · at least 12 characters" : "Password"}
                name="password"
                type="password"
                maxLength={128}
              />
              {join && (
                <p className="fine-print">
                  By joining, you agree to the{" "}
                  <a href="/privacy">community rules</a>. Your profile is
                  visible only to members unless you choose to make it public.
                </p>
              )}
            </Form>
            <p className="auth-switch">
              {join ? "Already a member?" : "New here?"}{" "}
              <a href={join ? "/signin" : "/join"}>
                {join ? "Sign in" : "Join Canopy"}
              </a>
            </p>
            {!join && (
              <p className="fine-print">
                Need help with your account?{" "}
                <a href="/contact">Contact Canopy</a>.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
function Contact() {
  const { act } = useApp();
  const [done, setDone] = useState(false);
  return (
    <>
      <PageHead
        label="GET IN TOUCH"
        title="What’s on your mind?"
        text="Questions, collaboration ideas, or a note for the Canopy team."
      />
      <div className="narrow">
        {done ? (
          <div className="success-panel">
            <Check />
            <h2>Message received.</h2>
            <p>Your message is private and has been sent to the Canopy team.</p>
            <button className="button" onClick={() => setDone(false)}>
              Send another message
            </button>
          </div>
        ) : (
          <Form
            submit="Send message"
            onSubmit={(v) => act("contact", v)}
            onDone={() => setDone(true)}
          >
            <Field label="Your name" name="name" maxLength={80} />
            <Field label="Email" name="email" type="email" maxLength={254} />
            <Field label="Message" name="body" type="textarea" />
            <p className="fine-print">
              Only the Canopy team can read this message. It won’t appear on the
              website.
            </p>
          </Form>
        )}
      </div>
    </>
  );
}
function Privacy() {
  return (
    <div className="prose narrow">
      <PageHead title="A few things to know." />
      <h2>Your information</h2>
      <p>
        Your email is used for your account and is not shown in the member
        directory. Your profile is shared with approved members. You can choose
        to show your name, bio and interests on the public website in Settings.
      </p>
      <h2>Conversations and projects</h2>
      <p>
        Member discussions stay in the community. Project-only posts are visible
        to that project’s participants and Canopy administrators. Direct
        messages are visible to the people in the conversation. They are not
        end-to-end encrypted.
      </p>
      <h2>Be considerate</h2>
      <p>
        Respect other members’ time and boundaries. Do not post harassment, spam
        or someone else’s private information. Use the report and block controls
        if something is wrong.
      </p>
      <h2>Public contributions</h2>
      <p>
        Submitting a note to the public wall gives Canopy permission to display
        that note with your name after review. Contact the team if you want a
        published note removed.
      </p>
      <h2>Account help</h2>
      <p>
        To request account deletion, a copy of your information, or help with
        access, <a href="/contact">contact Canopy</a>. Essential session
        cookies keep you signed in.
      </p>
    </div>
  );
}
function Shell({ children }: { children: React.ReactNode }) {
  return <PublicationFrame memberView>{children}</PublicationFrame>;
}
function Gate() {
  const { data } = useApp();
  return (
    <div className="gate">
      <Lock size={30} />
      <h1>
        {data.user?.status === "suspended" ? "Your member access is paused." : data.user ? "Your application is in." : "Inside Canopy."}
      </h1>
      <p>
        {data.user?.status === "suspended" ? "Contact Canopy about your account." : data.user
          ? "Canopy will review your account before you can join conversations and projects."
          : "Sign in or apply to join Canopy to meet members, share ideas, and take part in projects."}
      </p>
      <div className="inline">
        {!data.user && (
          <>
            <a className="button dark" href="/signin">
              Sign in
            </a>
            <a className="button" href="/join">
              Join Canopy
            </a>
          </>
        )}
        <a className="button" href="/preview/guide">
          Explore the member area
        </a>
      </div>
      {data.user && (
        <>
          <a className="underlined" href="/setup">
            Set up the first administrator
          </a>
          <Action action="signout">Sign out</Action>
        </>
      )}
    </div>
  );
}
function Setup() {
  const { act, data } = useApp();
  return (
    <div className="narrow">
      <PageHead
        title="Set up Canopy"
        text="The first administrator needs the private setup key provided with this website."
      />
      {!data.user ? (
        <a href="/join" className="button dark">
          Create an account first
        </a>
      ) : (
        <Form
          submit="Activate administrator"
          onSubmit={async (v) => {
            await act("claimAdmin", v);
            window.location.assign("/community/admin");
          }}
        >
          <Field label="Private setup key" name="key" maxLength={200} />
        </Form>
      )}
    </div>
  );
}
function People({ publicView = false }: { publicView?: boolean }) {
  const { data, act, base } = useApp();
  const [q, setQ] = useState("");
  const people = data.people.filter(
    (p: R) =>
      (!publicView || p.public_profile) &&
      `${p.name} ${p.bio} ${p.interests}`
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  return (
    <>
      <PageHead
        label={publicView ? "THE COMMUNITY" : undefined}
        title={publicView ? "Meet our members." : "Members"}
        text={
          publicView
            ? "A few of the people who make up Canopy."
            : "Find someone with a shared interest, or something different to offer."
        }
      />
      <div className="searchbox">
        <Search size={18} />
        <input
          aria-label="Search members"
          placeholder="Search names, interests, or skills"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="people-grid">
        {people.map((p: R) => {
          const c = data.connections.find((c: R) =>
            [c.requester_id, c.recipient_id].includes(p.id),
          );
          const blocked = data.blocks.some((b: R) => b.blocked_id === p.id);
          return (
            <article className="person-card" key={p.id}>
              <Avatar name={p.name} size="large" />
              <h3>{p.name}</h3>
              <p>{p.bio || "Still getting settled in."}</p>
              <div className="tag-list">
                {p.interests
                  .split(",")
                  .filter(Boolean)
                  .map((t: string) => (
                    <Pill key={t}>{t.trim()}</Pill>
                  ))}
              </div>
              {!publicView && p.id !== data.user?.id && (
                <div className="person-actions">
                  {blocked ? (
                    <Action
                      action="block"
                      body={{ userId: p.id, remove: true }}
                    >
                      Unblock
                    </Action>
                  ) : c?.status === "accepted" ? (
                    <a
                      href={base + "/messages?to=" + p.id}
                      className="button"
                    >
                      Message
                    </a>
                  ) : c?.status === "pending" &&
                    c.recipient_id === data.user?.id ? (
                    <>
                      <Action
                        action="respondConnection"
                        body={{ id: c.id, status: "accepted" }}
                        className="button dark"
                      >
                        Accept
                      </Action>
                      <Action
                        action="respondConnection"
                        body={{ id: c.id, status: "declined" }}
                      >
                        Decline
                      </Action>
                    </>
                  ) : c ? (
                    <Pill>
                      {c.status === "pending"
                        ? "Request sent"
                        : "Not connected"}
                    </Pill>
                  ) : (
                    <Modal
                      title={"Connect with " + p.name}
                      description="Add a short note if you’d like."
                      trigger={
                        <button className="button">
                          Connect <Plus size={15} />
                        </button>
                      }
                    >
                      {(close) => (
                        <Form
                          submit="Send invitation"
                          onSubmit={(v) =>
                            act("connect", { ...v, userId: p.id })
                          }
                          onDone={close}
                        >
                          <Field
                            label="Note"
                            name="note"
                            type="textarea"
                            required={false}
                            maxLength={300}
                          />
                        </Form>
                      )}
                    </Modal>
                  )}
                  <Modal
                    title="Member options"
                    trigger={
                      <button
                        className="quiet-button"
                        aria-label={"Options for " + p.name}
                      >
                        ···
                      </button>
                    }
                  >
                    {(close) => (
                      <div className="stack">
                        <Action
                          action="block"
                          body={{ userId: p.id, remove: blocked }}
                          success={
                            blocked ? "Member unblocked" : "Member blocked"
                          }
                        >
                          {blocked ? "Unblock member" : "Block member"}
                        </Action>
                        <Form
                          submit="Report to Canopy"
                          onSubmit={(v) =>
                            act("report", {
                              ...v,
                              targetType: "member",
                              targetId: p.id,
                            })
                          }
                          onDone={close}
                        >
                          <Field
                            label="What happened?"
                            name="reason"
                            type="textarea"
                            maxLength={2000}
                          />
                        </Form>
                      </div>
                    )}
                  </Modal>
                </div>
              )}
              {publicView && (
                <a className="text-link" href="/join">
                  Join to connect <Plus size={15} />
                </a>
              )}
            </article>
          );
        })}
      </div>
      {!people.length && (
        <Empty
          title={
            q ? "No matching members" : "Member introductions are on their way."
          }
        >
          {q
            ? "Try a different name or interest."
            : "Members can choose to share their profiles here."}
        </Empty>
      )}
      {publicView && (
        <section className="section">
          <h2>Notes from members</h2>
          <div className="card-grid">
            {data.posts
              .filter((p: R) => p.kind === "testimonial")
              .map((p: R) => (
                <article className="content-card" key={p.id}>
                  <p className="quote">“{p.body}”</p>
                  <span className="author-line">{p.author_name}</span>
                </article>
              ))}
          </div>
          {!data.posts.some((p: R) => p.kind === "testimonial") && (
            <p className="muted spaced">
              Member notes will appear here after review.
            </p>
          )}
        </section>
      )}
    </>
  );
}
function Composer({
  kind = "discussion",
  projectId,
  stageId,
}: {
  kind?: string;
  projectId?: string;
  stageId?: string;
}) {
  const { act, data, preview } = useApp();
  const [withPoll, setWithPoll] = useState(false);
  const title =
    kind === "idea"
      ? "Share an idea"
      : kind === "announcement"
        ? "Publish an announcement"
        : kind === "update"
          ? "Post an update"
          : kind === "testimonial"
            ? "Leave a public note"
            : "Start a discussion";
  return (
    <Modal
      title={title}
      description={
        kind === "testimonial"
          ? "Your note and name may appear on the public website after Canopy reviews it."
          : kind === "idea"
            ? "A few sentences is enough to start."
            : undefined
      }
      trigger={
        <button className="button dark">
          <Plus size={17} />
          {title}
        </button>
      }
    >
      {(close) => (
        <Form
          submit={kind === "testimonial" ? "Submit for review" : "Post"}
          onSubmit={async (v) => {
            const b: R = {
              ...v,
              kind,
              projectId,
              stageId,
              visibility: projectId ? "project" : v.visibility || "members",
            };
            if (withPoll)
              b.pollOptions = String(v.options)
                .split("\n")
                .map((x) => x.trim())
                .filter(Boolean);
            if (withPoll)
              b.closesAt = new Date(String(v.closesAt)).toISOString();
            await act("post", b);
          }}
          onDone={close}
        >
          <p className="composer-audience"><Lock size={13} /> {kind === "testimonial" ? "Public website · reviewed before publishing" : projectId ? "Project participants only" : ["discussion", "idea"].includes(kind) ? "Members only · stays off the public website" : "Choose the audience before publishing"}</p>
          <Field label="Title" name="title" maxLength={160} />
          <Field
            label={kind === "idea" ? "What would you like to do?" : "Text"}
            name="body"
            type="textarea"
            maxLength={8000}
          />
          {(data.user?.role === "admin" || preview) &&
            !projectId &&
            ["announcement", "update"].includes(kind) && (
              <Field label="Who can see this?" name="visibility">
                <Pick
                  name="visibility"
                  defaultValue="members"
                  options={[
                    { value: "members", label: "Members only" },
                    { value: "public", label: "Public website" },
                  ]}
                />
              </Field>
            )}
          {kind !== "testimonial" && (
            <label className="checkbox-row">
              <Checkbox
                checked={withPoll}
                onCheckedChange={(v) => setWithPoll(v === true)}
              />
              Add a poll
            </label>
          )}
          {withPoll && (
            <>
              <Field
                label="Options · one per line, 2–6 options"
                name="options"
                type="textarea"
                maxLength={600}
              />
              <Field
                label="Voting closes"
                name="closesAt"
                type="datetime-local"
              />
              <p className="fine-print">
                Votes are counted once per member. Members can change their vote
                before the deadline. Results show totals, not voter names.
              </p>
            </>
          )}
        </Form>
      )}
    </Modal>
  );
}
function PostCard({ post: p, detail = false }: { post: R; detail?: boolean }) {
  const now = useNow();
  const { data, act, base } = useApp();
  const [expanded, setExpanded] = useState(detail);
  const mine = data.interested.some((i: R) => i.post_id === p.id);
  const poll = data.polls.find((x: R) => x.post_id === p.id);
  const active = data.user?.status === "active";
  const comments = data.comments.filter((c: R) => c.post_id === p.id);
  return (
    <article
      className={
        "post-card " + (p.kind === "announcement" ? "announcement" : "")
      }
    >
      <div className="post-meta">
        <div className="inline">
          <Avatar name={p.author_name} />
          <div>
            <strong>{p.author_name}</strong>
            <small>
              {new Date(
                p.created_at.length === 10
                  ? p.created_at + "T12:00:00"
                  : p.created_at.replace(" ", "T") +
                      (p.created_at.includes("Z") ? "" : "Z"),
              ).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </small>
          </div>
        </div>
        <Pill>
          {p.kind === "announcement"
            ? "From Canopy"
            : p.kind === "idea"
              ? p.status
              : p.kind}
        </Pill>
      </div>
      <button
        className="post-title"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        {p.title}
      </button>
      <p className={expanded ? "post-body" : "post-body clamped"}>{p.body}</p>
      {p.project_id && (
        <a href={base + "/build/" + p.project_id} className="project-link">
          <Layers size={14} />
          View project
        </a>
      )}
      {poll && (
        <div className="poll">
          <p className="fine-print">
            {Date.parse(poll.closes_at) < now
              ? "Voting closed"
              : "Closes " +
                new Date(poll.closes_at).toLocaleDateString("en-US")}{" "}
            · one vote per member
          </p>
          {data.options
            .filter((o: R) => o.poll_id === poll.id)
            .map((o: R) => {
              const selected = data.votes.some(
                (v: R) => v.poll_id === poll.id && v.option_id === o.id,
              );
              return (
                <button
                  disabled={!active || Date.parse(poll.closes_at) < now}
                  key={o.id}
                  className={"poll-option " + (selected ? "selected" : "")}
                  onClick={async () => {
                    try {
                      await act("vote", { pollId: poll.id, optionId: o.id });
                    } catch (e) {
                      toast.error((e as Error).message);
                    }
                  }}
                >
                  <span>
                    {selected && <Check size={15} />} {o.label}
                  </span>
                  <span>{o.votes}</span>
                </button>
              );
            })}
        </div>
      )}
      <div className="post-actions">
        <button onClick={() => setExpanded(!expanded)} className="quiet-button">
          <MessageSquare size={16} />
          {comments.length} {comments.length === 1 ? "reply" : "replies"}
        </button>
        {p.kind === "idea" && active && (
          <Action
            className={"quiet-button " + (mine ? "selected" : "")}
            action="interest"
            body={{ postId: p.id, remove: mine }}
          >
            <Heart size={16} fill={mine ? "currentColor" : "none"} />
            {p.interest_count} interested
          </Action>
        )}
        {active && (
          <Modal
            title="Report this post"
            trigger={
              <button
                className="quiet-button report-button"
                aria-label="Report this post"
              >
                <Flag size={14} />
              </button>
            }
          >
            {(close) => (
              <Form
                submit="Send report"
                onSubmit={(v) =>
                  act("report", { ...v, targetType: "post", targetId: p.id })
                }
                onDone={close}
              >
                <Field
                  label="What happened?"
                  name="reason"
                  type="textarea"
                  maxLength={2000}
                />
              </Form>
            )}
          </Modal>
        )}
      </div>
      {expanded && (
        <div className="comments">
          {comments.map((c: R) => (
            <div className="comment" key={c.id}>
              <Avatar name={c.author_name} />
              <div>
                <strong>{c.author_name}</strong>
                <p>{c.body}</p>
              </div>
            </div>
          ))}
          {active ? (
            <Form
              submit="Reply"
              onSubmit={async (v) => {
                await act("comment", { ...v, postId: p.id });
              }}
            >
              <Field label="Add a reply" name="body" type="textarea" />
            </Form>
          ) : (
            <a href="/signin" className="underlined">
              Sign in to join the conversation
            </a>
          )}
        </div>
      )}
      {p.kind === "idea" &&
        active &&
        !p.project_id &&
        (p.author_id === data.user.id || data.user.role === "admin") && (
          <div className="post-followup">
            <CreateProject idea={p} />
          </div>
        )}
      {p.kind === "idea" && data.user?.role === "admin" && (
        <div className="inline">
          {["reviewing", "on-hold"].map((status) => (
            <Action
              key={status}
              action="ideaStatus"
              body={{ id: p.id, status }}
              className="quiet-button"
            >
              Mark {status}
            </Action>
          ))}
        </div>
      )}
    </article>
  );
}
function Conversations() {
  const { data, base } = useApp();
  const [q, setQ] = useState("");
  const [section, setSection] = useState("discussions");
  const params = new URLSearchParams(useApp().search);
  const focused = params.get("post");
  const official = data.posts.filter((p: R) => !p.project_id && ["announcement", "update"].includes(p.kind));
  const discussions = data.posts.filter((p: R) => !p.project_id && p.kind === "discussion");
  const matches = (section === "announcements" ? official : discussions).filter((p: R) => `${p.title} ${p.body}`.toLowerCase().includes(q.toLowerCase()));
  const selected = focused ? data.posts.find((p: R) => p.id === focused && !p.project_id) : null;
  return <div className="discussion-home">
    <PageHead title="Discussions" text="What’s on your mind?" action={<Composer/>}/>
    {focused ? <><a href={base} className="quiet-section-link">← All discussions</a>{selected ? <PostCard post={selected} detail/> : <Empty title="This conversation isn’t available."/>}</> : <>
      {official[0] && <a className="pinned-notice" href={base + "/conversations?post=" + official[0].id}><span>From Canopy</span><strong>{official[0].title}</strong><span aria-hidden="true">↗</span></a>}
      <Tabs value={section} onValueChange={setSection}>
        <div className="discussion-toolbar"><TabsList variant="line"><TabsTrigger value="discussions">Discussions</TabsTrigger><TabsTrigger value="announcements">Announcements</TabsTrigger></TabsList><div className="searchbox"><Search size={16}/><input aria-label="Search discussions" placeholder="Search" value={q} onChange={e => setQ(e.target.value)}/></div></div>
        <TabsContent value={section} className="discussion-list">
          {matches.map((p: R) => <PostCard post={p} key={p.id}/>)}
          {!matches.length && <Empty title={q ? "No matching conversations." : section === "announcements" ? "No announcements yet." : "Start the first discussion."}>{q ? "Try another word." : section === "discussions" ? "Ask a question, share a find, or see who wants to join you." : null}</Empty>}
        </TabsContent>
      </Tabs>
    </>}
  </div>;
}
function CreateProject({ idea }: { idea?: R }) {
  const { act, base, data } = useApp();
  return (
    <Modal
      title={idea ? "Turn this idea into a project" : "Start a project"}
      description="Give it a name and a first direction. You’ll be the project lead."
      trigger={
        <button className={idea ? "quiet-button" : "button"}>
          <Plus size={16} />
          {idea ? "Start a project from this idea" : "Start a project"}
        </button>
      }
    >
      {(close) => (
        <Form
          submit="Create project"
          onSubmit={async (v) => {
            const r = await act("createProject", { ...v, ideaId: idea?.id });
            close();
            window.location.assign(base + "/build/" + r.id);
          }}
        >
          <Field
            label="Project name"
            name="title"
            defaultValue={idea?.title}
            maxLength={160}
          />
          <Field
            label="What are you working toward?"
            name="description"
            type="textarea"
            defaultValue={idea?.body}
            maxLength={8000}
          />
          <Field label="Who can see the project?" name="visibility">
            <Pick
              name="visibility"
              defaultValue="members"
              options={[
                { value: "members", label: "All members" },
                { value: "project", label: "Project participants only" },
                ...(data.user?.role === "admin"
                  ? [{ value: "public", label: "Public website" }]
                  : []),
              ]}
            />
          </Field>
        </Form>
      )}
    </Modal>
  );
}
function ProjectCard({ project: p }: { project: R }) {
  const { base } = useApp();
  return (
    <a href={base + "/build/" + p.id} className="project-card">
      <div className="project-card-top">
        <Layers size={25} />
        <Pill>{p.stage}</Pill>
      </div>
      <h3>{p.title}</h3>
      <p>{p.description}</p>
      <div className="project-card-bottom">
        <Avatar name={p.owner_name || "Canopy"} />
        <span>{p.owner_name}</span>
        <span className="small-label">VIEW PROJECT</span>
      </div>
    </a>
  );
}
function Build() {
  const { data } = useApp();
  return (
    <>
      <PageHead
        title="Ideas & projects"
        text="Bring an idea, find a project, or see what needs a hand."
        action={<Composer kind="idea" />}
      />
      <Tabs defaultValue="ideas">
        <TabsList variant="line" className="mb-6 border-b w-full justify-start">
          <TabsTrigger value="ideas">
            Ideas{" "}
            <span className="tab-count">
              {
                data.posts.filter((p: R) => p.kind === "idea" && !p.project_id)
                  .length
              }
            </span>
          </TabsTrigger>
          <TabsTrigger value="projects">
            Projects <span className="tab-count">{data.projects.length}</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="ideas">
          <div className="build-intro">
            <p>An idea doesn’t need a plan yet.</p>
            <span>
              Members can add suggestions, ask questions, or offer to help.
            </span>
          </div>
          <div className="card-grid">
            {data.posts
              .filter((p: R) => p.kind === "idea" && !p.project_id)
              .map((p: R) => (
                <PostCard post={p} key={p.id} />
              ))}
          </div>
          {!data.posts.some((p: R) => p.kind === "idea" && !p.project_id) && (
            <Empty title="What would you like to try?">
              Share the first idea with the community.
            </Empty>
          )}
        </TabsContent>
        <TabsContent value="projects">
          <div className="section-head">
            <span className="muted">
              Projects with a person and a next step behind them.
            </span>
            <CreateProject />
          </div>
          <div className="card-grid">
            {data.projects.map((p: R) => (
              <ProjectCard project={p} key={p.id} />
            ))}
          </div>
          {!data.projects.length && (
            <Empty title="No projects yet.">
              Start one, or discuss an idea first.
            </Empty>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
function EventRow({ event: e }: { event: R }) {
  const now = useNow();
  const { data, community, base } = useApp();
  const d = new Date(e.starts_at),
    going = data.rsvps.some((r: R) => r.event_id === e.id);
  return (
    <div className="event-row">
      <div className="date-block">
        <small>
          {d.toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
        </small>
        <strong>{d.getDate()}</strong>
      </div>
      <div className="event-info">
        <span className="small-label">
          {e.visibility === "public" ? "OPEN EVENT" : "MEMBERS’ EVENT"}
        </span>
        <h3>{e.title}</h3>
        <p>
          {d.toLocaleDateString("en-US", { weekday: "long" })} ·{" "}
          {d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}{" "}
          · {e.location}
        </p>
      </div>
      <Modal
        title={e.title}
        description={d.toLocaleString("en-US", {
          dateStyle: "full",
          timeStyle: "short",
        })}
        trigger={
          <button className="button">
            {going ? "You’re going" : "View event"}
          </button>
        }
      >
        {() => (
          <div className="stack">
            <p className="muted inline">
              <MapPin size={17} />
              {e.location}
            </p>
            <p className="preserve">{e.description}</p>
            {Date.parse(e.starts_at) < now ? (
              <Pill>Past event</Pill>
            ) : community && data.user?.status === "active" ? (
              <Action
                action="rsvp"
                body={{ eventId: e.id, remove: going }}
                className="button dark"
                success={going ? "RSVP cancelled" : "You’re on the list"}
              >
                {going ? "Cancel RSVP" : "RSVP"}
              </Action>
            ) : (
              <>
                <a href={data.user ? base + "/events" : "/join"} className="button dark">
                  {data.user ? "RSVP in the member area" : "Join to RSVP"}
                </a>
                <a href="/contact" className="underlined">
                  Ask Canopy about attending
                </a>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
function Events() {
  const now = useNow();
  const { data, community } = useApp();
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [showPast, setShowPast] = useState(false);
  const events = data.events.filter((e: R) =>
    showPast ? Date.parse(e.starts_at) < now : Date.parse(e.starts_at) >= now,
  );
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return (
    <>
      <PageHead
        title="On the calendar."
        text="Find a date that works for you."
        action={community && data.user?.role === "admin" ? <EventComposer /> : undefined}
      />
      <Tabs defaultValue={community ? "upcoming" : "calendar"}>
        <TabsList variant="line" className="mb-6">
          <TabsTrigger value="upcoming">List</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <label className="checkbox-row mb-5">
            <Checkbox
              checked={showPast}
              onCheckedChange={(v) => setShowPast(v === true)}
            />
            Show past events
          </label>
          {events.map((e: R) => (
            <EventRow event={e} key={e.id} />
          ))}
          {!events.length && (
            <Empty
              title={
                showPast ? "No past events yet." : "No dates announced yet."
              }
            >
              Check back for the next Canopy event.
            </Empty>
          )}
        </TabsContent>
        <TabsContent value="calendar">
          <div className="section-head">
            <h2>
              {month.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <div className="inline">
              <button
                className="icon-button"
                aria-label="Previous month"
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() - 1, 1),
                  )
                }
              >
                <ChevronLeft />
              </button>
              <button
                className="icon-button"
                aria-label="Next month"
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() + 1, 1),
                  )
                }
              >
                <ChevronRight />
              </button>
            </div>
          </div>
          <div className="calendar">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div className="calendar-label" key={d}>
                {d}
              </div>
            ))}
            {Array.from({ length: month.getDay() }, (_, i) => (
              <div className="calendar-day empty" key={"empty" + i} />
            ))}
            {Array.from({ length: days }, (_, i) => {
              const list = data.events.filter((e: R) => {
                const d = new Date(e.starts_at);
                return (
                  d.getDate() === i + 1 &&
                  d.getMonth() === month.getMonth() &&
                  d.getFullYear() === month.getFullYear()
                );
              });
              return (
                <div className="calendar-day" key={i}>
                  <span>{i + 1}</span>
                  {list.map((e: R) => (
                    <Modal
                      key={e.id}
                      title={e.title}
                      description={new Date(e.starts_at).toLocaleString()}
                      trigger={
                        <button className="calendar-event">{e.title}</button>
                      }
                    >
                      {() => (
                        <div className="stack">
                          <p>{e.description}</p>
                          <p>{e.location}</p>
                          {data.user?.status === "active" && (
                            <Action
                              action="rsvp"
                              body={{
                                eventId: e.id,
                                remove: data.rsvps.some(
                                  (r: R) => r.event_id === e.id,
                                ),
                              }}
                            >
                              {data.rsvps.some((r: R) => r.event_id === e.id)
                                ? "Cancel RSVP"
                                : "RSVP"}
                            </Action>
                          )}
                        </div>
                      )}
                    </Modal>
                  ))}
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
      <p className="fine-print spaced">
        Times are shown in your local time zone.
      </p>
    </>
  );
}
function EventComposer() {
  const { act, data } = useApp();
  return (
    <Modal
      title="Add an event"
      trigger={
        <button className="button dark">
          <Plus size={16} />
          Add event
        </button>
      }
    >
      {(close) => (
        <Form
          submit="Publish event"
          onSubmit={(v) =>
            act("event", {
              ...v,
              startsAt: new Date(String(v.startsAt)).toISOString(),
            })
          }
          onDone={close}
        >
          <Field label="Event name" name="title" maxLength={160} />
          <Field
            label="Description"
            name="description"
            type="textarea"
            maxLength={8000}
          />
          <Field
            label="Starts · your local time"
            name="startsAt"
            type="datetime-local"
          />
          <Field
            label="Location or meeting link"
            name="location"
            maxLength={200}
          />
          <Field label="Visibility" name="visibility">
            <Pick
              name="visibility"
              defaultValue="public"
              options={[
                { value: "public", label: "Public" },
                { value: "members", label: "Members" },
                { value: "project", label: "Project participants" },
              ]}
            />
          </Field>
          <Field
            label="Related project · optional"
            name="projectId"
            required={false}
          >
            <Pick
              name="projectId"
              options={data.projects.map((p: R) => ({
                value: p.id,
                label: p.title,
              }))}
              placeholder="No project"
            />
          </Field>
        </Form>
      )}
    </Modal>
  );
}
function ProjectDetail({ id }: { id: string }) {
  const { data, act, base } = useApp();
  const p = data.projects.find((p: R) => p.id === id);
  if (!p)
    return (
      <Empty title="Project not found.">
        It may be private, or no longer available.
      </Empty>
    );
  const lead = p.owner_id === data.user?.id || data.user?.role === "admin";
  const membership = data.projectMembers.find(
    (m: R) => m.project_id === id && m.user_id === data.user?.id,
  );
  const participating = lead || membership?.status === "active";
  const stages = data.stages.filter((s: R) => s.project_id === id);
  const current = stages.find((s: R) => s.status === "current");
  return (
    <>
      <a className="back-link" href={base + "/build"}>Ideas & projects</a>
      <PageHead
        label={p.stage.toUpperCase()}
        title={p.title}
        text={p.description}
        action={
          !participating ? (
            membership ? (
              <Pill>Request {membership.status}</Pill>
            ) : (
              <Action
                action="joinProject"
                body={{ projectId: id }}
                className="button dark"
              >
                Ask to join
              </Action>
            )
          ) : (
            <Pill>{lead ? "Project lead" : "Project member"}</Pill>
          )
        }
      />
      {lead && <div className="stage-controls"><Modal title="Change project stage" trigger={<button className="button">Change stage</button>}>{close => <div className="stack"><p>Current stage: {p.stage}</p>{["Planning", "Recruiting", "In progress", "Completed"].map(stage => <button key={stage} className={"button " + (p.stage === stage ? "dark" : "")} onClick={async () => {try {await act("projectStage", {projectId:id,stage});close();} catch(error) {toast.error((error as Error).message);}}}>{stage}</button>)}</div>}</Modal></div>}
      {!participating ? (
        <div className="quiet-panel">
          <Lock size={22} />
          <p>
            Project discussions, tasks, and participants are visible after you
            join.
          </p>
        </div>
      ) : (
        <>
          <div className="stage-track">
            {stages.map((s: R, i: number) => (
              <div key={s.id} className={"stage " + s.status}>
                <span>
                  {s.status === "done" ? (
                    <Check size={17} />
                  ) : (
                    String(i + 1).padStart(2, "0")
                  )}
                </span>
                <strong>{s.name}</strong>
                <small>
                  {s.status === "current"
                    ? "Current stage"
                    : s.status === "done"
                      ? "Completed"
                      : "Upcoming"}
                </small>
              </div>
            ))}
          </div>
          <Tabs defaultValue="ideas">
            <TabsList variant="line" className="mb-6 flex-wrap h-auto">
              <TabsTrigger value="ideas">Ideas & discussion</TabsTrigger>
              <TabsTrigger value="updates">Updates</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
            </TabsList>
            <TabsContent value="ideas">
              <div className="section-head">
                <div>
                  <h2>What should we include?</h2>
                  <p className="muted">
                    Suggestions for{" "}
                    {current?.name.toLowerCase() || "this stage"}.
                  </p>
                </div>
                <Composer kind="idea" projectId={id} stageId={current?.id} />
              </div>
              <div className="feed">
                {data.posts
                  .filter((x: R) => x.project_id === id && x.kind !== "update")
                  .map((x: R) => (
                    <PostCard post={x} key={x.id} />
                  ))}
              </div>
              {!data.posts.some(
                (x: R) => x.project_id === id && x.kind !== "update",
              ) && (
                <Empty title="Start with a suggestion.">
                  Collect ideas here as the project takes shape.
                </Empty>
              )}
            </TabsContent>
            <TabsContent value="updates">
              <div className="section-head">
                <h2>Project updates</h2>
                {lead && <Composer kind="update" projectId={id} />}
              </div>
              {data.posts
                .filter((x: R) => x.project_id === id && x.kind === "update")
                .map((x: R) => (
                  <PostCard post={x} key={x.id} />
                ))}
              {!data.posts.some(
                (x: R) => x.project_id === id && x.kind === "update",
              ) && <Empty title="No updates yet." />}
            </TabsContent>
            <TabsContent value="tasks">
              <div className="section-head">
                <h2>The next steps</h2>
                {lead && (
                  <Modal
                    title="Add a task"
                    trigger={
                      <button className="button dark">
                        <Plus size={16} />
                        Add task
                      </button>
                    }
                  >
                    {(close) => (
                      <Form
                        submit="Add task"
                        onSubmit={(v) => act("task", { ...v, projectId: id })}
                        onDone={close}
                      >
                        <Field label="Task" name="title" maxLength={200} />
                        <Field
                          label="Assignee · optional"
                          name="assigneeId"
                          required={false}
                        >
                          <Pick
                            name="assigneeId"
                            placeholder="Unassigned"
                            options={data.projectMembers
                              .filter(
                                (m: R) =>
                                  m.project_id === id && m.status === "active",
                              )
                              .map((m: R) => ({
                                value: m.user_id,
                                label: m.name,
                              }))}
                          />
                        </Field>
                        <Field
                          label="Due date · optional"
                          name="dueDate"
                          type="date"
                          required={false}
                        />
                      </Form>
                    )}
                  </Modal>
                )}
              </div>
              {data.tasks
                .filter((t: R) => t.project_id === id)
                .map((t: R) => (
                  <div className="task-row" key={t.id}>
                    <div>
                      <h3>{t.title}</h3>
                      <p>
                        {data.people.find((p: R) => p.id === t.assignee_id)
                          ?.name || "Unassigned"}
                        {t.due_date ? " · Due " + t.due_date : ""}
                      </p>
                    </div>
                    {lead || t.assignee_id === data.user?.id ? (
                      <Action
                        action="taskStatus"
                        body={{
                          id: t.id,
                          status:
                            t.status === "done"
                              ? "todo"
                              : t.status === "todo"
                                ? "doing"
                                : "done",
                        }}
                      >
                        <span>
                          {t.status === "done"
                            ? "✓ Done"
                            : t.status === "doing"
                              ? "In progress"
                              : "To do"}
                        </span>
                      </Action>
                    ) : (
                      <Pill>{t.status}</Pill>
                    )}
                  </div>
                ))}
              {!data.tasks.some((t: R) => t.project_id === id) && (
                <Empty title="No tasks added yet." />
              )}
            </TabsContent>
            <TabsContent value="people">
              {lead && (
                <Modal
                  title="Add a project member"
                  description="This member will be able to read project discussions and take part in the work."
                  trigger={
                    <button className="button dark">
                      <Plus size={16} />
                      Add member
                    </button>
                  }
                >
                  {(close) => (
                    <Form
                      submit="Add member"
                      onSubmit={(v) =>
                        act("addProjectMember", { ...v, projectId: id })
                      }
                      onDone={close}
                    >
                      <Field label="Member" name="userId">
                        <Pick
                          name="userId"
                          options={data.people
                            .filter(
                              (person: R) =>
                                !data.projectMembers.some(
                                  (m: R) =>
                                    m.project_id === id &&
                                    m.user_id === person.id &&
                                    m.status === "active",
                                ),
                            )
                            .map((person: R) => ({
                              value: person.id,
                              label: person.name,
                            }))}
                        />
                      </Field>
                    </Form>
                  )}
                </Modal>
              )}
              {data.projectMembers
                .filter((m: R) => m.project_id === id)
                .map((m: R) => (
                  <div className="member-row" key={m.user_id}>
                    <Avatar name={m.name} />
                    <div>
                      <h3>{m.name}</h3>
                      <p>{m.role === "lead" ? "Project lead" : m.status}</p>
                    </div>
                    {lead && m.status === "pending" && (
                      <div className="inline">
                        <Action
                          action="projectMember"
                          body={{
                            projectId: id,
                            userId: m.user_id,
                            status: "active",
                          }}
                        >
                          Approve
                        </Action>
                        <Action
                          action="projectMember"
                          body={{
                            projectId: id,
                            userId: m.user_id,
                            status: "declined",
                          }}
                        >
                          Decline
                        </Action>
                      </div>
                    )}
                  </div>
                ))}
            </TabsContent>
          </Tabs>
        </>
      )}
    </>
  );
}
function CommunityHome() {
  return <Conversations/>;
}
function Messages() {
  const { data, act } = useApp();
  const params = new URLSearchParams(useApp().search);
  const [selected, setSelected] = useState(params.get("to") || "");
  const people = data.people.filter(
    (p: R) =>
      p.id !== data.user?.id && data.connections.some(
        (c: R) =>
          c.status === "accepted" &&
          [c.requester_id, c.recipient_id].includes(p.id),
      ) && !data.blocks.some((b: R) => b.blocked_id === p.id),
  );
  const current = people.find((p: R) => p.id === selected) || (!selected ? people[0] : undefined);
  const [body, setBody] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <>
      <PageHead
        title="Messages"
        text="Private conversations with your connections."
      />
      <div className="messages-layout">
        <div className="message-list">
          {people.map((p: R) => (
            <button
              className={current?.id === p.id ? "active" : ""}
              key={p.id}
              onClick={() => setSelected(p.id)}
            >
              <Avatar name={p.name} />
              <span>{p.name}</span>
            </button>
          ))}
          {!people.length && (
            <Empty title="No connections yet.">
              Connect with a member to start a private conversation.
            </Empty>
          )}
        </div>
        <div className="message-thread">
          {current ? (
            <>
              <div className="thread-header">
                <Avatar name={current.name} />
                <h3>{current.name}</h3>
              </div>
              <div className="message-bubbles">
                {data.messages
                  .filter(
                    (m: R) =>
                      (m.sender_id === current.id &&
                        m.recipient_id === data.user.id) ||
                      (m.recipient_id === current.id &&
                        m.sender_id === data.user.id),
                  )
                  .map((m: R) => (
                    <div
                      className={
                        "bubble " + (m.sender_id === data.user.id ? "mine" : "")
                      }
                      key={m.id}
                    >
                      <p>{m.body}</p>
                      <small>
                        {new Date(m.created_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </small>
                      {m.sender_id !== data.user.id && (
                        <Modal
                          title="Report this message"
                          trigger={
                            <button
                              className="quiet-button"
                              aria-label="Report message"
                            >
                              <Flag size={12} />
                            </button>
                          }
                        >
                          {(close) => (
                            <Form
                              submit="Report message"
                              onSubmit={(v) =>
                                act("report", {
                                  ...v,
                                  targetType: "message",
                                  targetId: m.id,
                                })
                              }
                              onDone={close}
                            >
                              <Field
                                label="What happened?"
                                name="reason"
                                type="textarea"
                              />
                            </Form>
                          )}
                        </Modal>
                      )}
                    </div>
                  ))}
              </div>
              <form
                className="message-compose"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!body.trim() || busy) return;
                  setBusy(true);
                  try {
                    await act("message", { userId: current.id, body });
                    setBody("");
                  } catch (e) {
                    toast.error((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <textarea
                  aria-label="Message"
                  placeholder="Write a message…"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  maxLength={4000}
                  required
                />
                <button className="button dark" disabled={busy}>
                  {busy ? "Sending…" : "Send"}
                </button>
              </form>
            </>
          ) : (
            <Empty title="Choose a conversation.">
              Messages are visible only to you and the recipient.
            </Empty>
          )}
        </div>
      </div>
    </>
  );
}
function Notifications() {
  const { data, base } = useApp();
  return (
    <>
      <PageHead
        title="Notifications"
        action={<Action action="readNotifications">Mark all as read</Action>}
      />
      {data.notifications.map((n: R) => (
        <a
          key={n.id}
          href={n.href.replace("/community", base)}
          className={"notification " + (!n.read ? "unread" : "")}
        >
          <Bell size={18} />
          <div>
            <p>{n.body}</p>
            <small>{new Date(n.created_at).toLocaleString()}</small>
          </div>
          {!n.read && <Pill>New</Pill>}
        </a>
      ))}
      {!data.notifications.length && <Empty title="Nothing new right now." />}
    </>
  );
}
function SettingsPage() {
  const { data, act } = useApp();
  const [isPublic, setPublic] = useState(!!data.user.public_profile);
  return (
    <>
      <PageHead
        title="Your profile"
        text="Let people know a little about you."
      />
      <div className="settings-grid">
        <section>
          <Form
            onSubmit={async (v) => {
              await act("profile", { ...v, public_profile: isPublic });
              toast.success("Profile saved");
            }}
          >
            <Field
              label="Name"
              name="name"
              defaultValue={data.user.name}
              maxLength={80}
            />
            <Field
              label="About you"
              name="bio"
              type="textarea"
              required={false}
              defaultValue={data.user.bio}
              maxLength={1200}
            />
            <Field
              label="Interests or skills · separated by commas"
              name="interests"
              required={false}
              defaultValue={data.user.interests}
              maxLength={300}
            />
            <label className="checkbox-row">
              <Checkbox
                checked={isPublic}
                onCheckedChange={(v) => setPublic(v === true)}
              />
              Show my profile on the public website
            </label>
            <p className="fine-print">
              This shares your name, bio and interests. Your email remains
              private.
            </p>
          </Form>
        </section>
        <aside className="stack">
          <div className="content-card">
            <h3>Your account</h3>
            <p>{data.user.email}</p>
            <Pill>{data.user.status}</Pill>
          </div>
          <div className="content-card">
            <h3>A note for the website</h3>
            <p>Share something about your experience with Canopy.</p>
            <Composer kind="testimonial" />
          </div>
          <Modal
            title="Change password"
            trigger={<button className="button">Change password</button>}
          >
            {(close) => (
              <Form
                submit="Update password"
                onSubmit={(v) => act("password", v)}
                onDone={close}
              >
                <Field
                  label="Current password"
                  name="current"
                  type="password"
                />
                <Field
                  label="New password · at least 12 characters"
                  name="password"
                  type="password"
                />
              </Form>
            )}
          </Modal>
        </aside>
      </div>
    </>
  );
}
function Admin() {
  const { data, act, preview } = useApp();
  if (!preview && data.user?.role !== "admin")
    return <Empty title="This page is for Canopy administrators." />;
  const a = (preview ? sampleAdmin : data.admin) || {
    users: [],
    contacts: [],
    reports: [],
    testimonials: [],
  };
  return (
    <>
      <PageHead
        title="Canopy admin"
        text="Publish updates, review membership, and look after the community."
      />
      <div className="admin-summary"><div><strong>{a.users.filter((u: R) => u.status === "pending").length}</strong><span>Membership requests</span></div><div><strong>{a.contacts.filter((c: R) => c.status === "new").length}</strong><span>New messages</span></div><div><strong>{a.testimonials.filter((p: R) => !p.published).length}</strong><span>Notes to review</span></div></div>
      <Tabs defaultValue="members">
        <TabsList variant="line" className="flex-wrap h-auto mb-6">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="publish">Publish</TabsTrigger>
          <TabsTrigger value="inbox">
            Inbox ({a.contacts.filter((c: R) => c.status === "new").length})
          </TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>
        <TabsContent value="members">
          {!a.users.length && <Empty title="No membership applications yet."/>}
          {a.users.map((u: R) => (
            <div className="member-row" key={u.id}>
              <Avatar name={u.name} />
              <div>
                <h3>{u.name}</h3>
                <p>{u.email}</p>
              </div>
              <Pill>{u.status}</Pill>
              {u.role !== "admin" && (
                <div className="inline">
                  {u.status !== "active" && (
                    <Action
                      action="memberStatus"
                      body={{ id: u.id, status: "active" }}
                      className="button dark"
                    >
                      Approve
                    </Action>
                  )}
                  {u.status === "active" && (
                    <Action
                      action="memberStatus"
                      body={{ id: u.id, status: "suspended" }}
                    >
                      Suspend
                    </Action>
                  )}
                </div>
              )}
            </div>
          ))}
        </TabsContent>
        <TabsContent value="publish">
          <div className="admin-actions">
            <div className="content-card">
              <h3>Official updates</h3>
              <p>Choose whether an announcement is public or for members.</p>
              <Composer kind="announcement" />
            </div>
            <div className="content-card">
              <h3>Events</h3>
              <p>Add dates to the calendar.</p>
              <EventComposer />
            </div>
            <div className="content-card">
              <h3>Partners</h3>
              <p>Add confirmed partners to the website.</p>
              <Modal
                title="Add a partner"
                trigger={
                  <button className="button">
                    <Plus size={16} />
                    Add partner
                  </button>
                }
              >
                {(close) => (
                  <Form
                    submit="Add partner"
                    onSubmit={(v) => act("partner", v)}
                    onDone={close}
                  >
                    <Field
                      label="Organization name"
                      name="name"
                      maxLength={100}
                    />
                    <Field
                      label="About the partnership"
                      name="description"
                      type="textarea"
                      maxLength={1000}
                    />
                    <Field
                      label="Website · HTTPS"
                      name="url"
                      type="url"
                      maxLength={1000}
                    />
                  </Form>
                )}
              </Modal>
            </div>
          </div>
          <h2 className="spaced">Published content</h2>
          {data.posts
            .filter((p: R) => p.kind !== "testimonial")
            .map((p: R) => (
              <div className="member-row" key={p.id}>
                <div>
                  <h3>{p.title}</h3>
                  <p>
                    {p.kind} · {p.visibility}
                  </p>
                </div>
                <Action
                  action="moderatePost"
                  body={{ id: p.id, published: !p.published }}
                >
                  {p.published ? "Unpublish" : "Publish"}
                </Action>
              </div>
            ))}
        </TabsContent>
        <TabsContent value="inbox">
          {a.contacts.map((c: R) => (
            <article className="content-card" key={c.id}>
              <div className="section-head">
                <h3>{c.name}</h3>
                <Pill>{c.status}</Pill>
              </div>
              <a className="underlined" href={"mailto:" + c.email}>
                {c.email}
              </a>
              <p className="preserve">{c.body}</p>
              {c.status === "new" && (
                <Action action="contactStatus" body={{ id: c.id }}>
                  Mark handled
                </Action>
              )}
            </article>
          ))}
          {!a.contacts.length && <Empty title="No messages yet." />}
        </TabsContent>
        <TabsContent value="review">
          <h2>Public notes</h2>
          {a.testimonials.map((p: R) => (
            <article className="content-card" key={p.id}>
              <h3>{p.author_name}</h3>
              <p>{p.body}</p>
              <Action
                action="moderatePost"
                body={{ id: p.id, published: !p.published }}
              >
                {p.published ? "Remove from website" : "Approve for website"}
              </Action>
            </article>
          ))}
          {!a.testimonials.length && <Empty title="No public notes waiting for review."/>}
          <h2 className="spaced">Reports</h2>
          {a.reports.map((r: R) => (
            <article className="content-card" key={r.id}>
              <div className="inline">
                <Pill>{r.target_type}</Pill>
                <Pill>{r.status}</Pill>
              </div>
              <p>{r.reason}</p>
              <small className="muted">Reference: {r.target_id}</small>
              {r.status === "open" && (
                <div className="inline spaced">
                  <Action action="resolveReport" body={{ id: r.id }}>
                    Mark resolved
                  </Action>
                  {r.target_type === "post" && (
                    <Action
                      action="moderatePost"
                      body={{ id: r.target_id, published: false }}
                    >
                      Unpublish post
                    </Action>
                  )}
                  {r.target_type === "member" && (
                    <Action
                      action="memberStatus"
                      body={{ id: r.target_id, status: "suspended" }}
                    >
                      Suspend member
                    </Action>
                  )}
                </div>
              )}
            </article>
          ))}
          {!a.reports.length && <Empty title="No reports to review." />}
        </TabsContent>
      </Tabs>
    </>
  );
}
function Explore() {
  const { data } = useApp();
  const projects = data.projects.filter((p: R) => p.visibility === "public");
  return <>
    <PageHead title="Projects" text="What people are making together."/>
    <div className="public-project-directory">{projects.map((p: R) => <a className="project-card" key={p.id} href={"/explore/" + p.id}><Pill>{p.stage}</Pill><h3>{p.title}</h3><p>{p.description}</p><span className="underlined">View project</span></a>)}</div>
    {!projects.length && <div className="project-start"><h2>What would you like to make happen?</h2><p>Public projects will appear here. Inside Canopy, members collect ideas, find collaborators and plan the work.</p><a className="button dark" href="/community/build">Visit ideas & projects</a></div>}
    <div className="project-process" aria-label="How projects develop">{["Share an idea", "Make a plan", "Find your team", "Get to work"].map((label, i) => <div key={label}><span>{String(i + 1).padStart(2, "0")}</span><h3>{label}</h3></div>)}</div>
  </>;
}
function PublicProject({id}: {id: string}) {
  const {data} = useApp();
  const p = data.projects.find((p: R) => p.id === id && p.visibility === "public");
  return <><a className="back-link" href="/explore">All projects</a>{p ? <><PageHead label={p.stage} title={p.title} text={p.description}/><div className="project-public-details"><section><h2>Take part</h2><p>Members can ask to join this project and follow its planning, ideas and next steps.</p><a className="button dark" href={"/community/build/" + p.id}>Open in the member area</a></section><aside><span className="small-label">PROJECT STAGE</span><h3>{p.stage}</h3><p>Canopy project</p></aside></div></> : <Empty title="This project isn’t public.">Browse the other projects or sign in to the member area.</Empty>}</>;
}
function PublicUpdates() {
  const {data} = useApp();
  const posts = data.posts.filter((p: R) => p.visibility === "public" && ["announcement", "update"].includes(p.kind));
  return <><PageHead title="From Canopy" text="Announcements and updates from the team."/><div className="official-updates">{posts.map((p: R) => <PublicPost post={p} key={p.id}/>)}</div>{!posts.length && <Empty title="Nothing published yet.">Official announcements will appear here. For questions in the meantime, contact Canopy.</Empty>}<a className="underlined" href="/contact">Contact Canopy</a></>;
}
const sampleAdmin = {
  users: [{id:"sample-applicant",name:"Alex Morgan",email:"alex@example.test",status:"pending",role:"member"},{id:"demo-maya",name:"Maya Chen",email:"maya@example.test",status:"active",role:"member"}],
  contacts: [{id:"sample-contact",name:"Robin Lee",email:"robin@example.test",status:"new",body:"Could we talk about hosting a small workshop together?"}],
  testimonials: [{id:"sample-note",author_name:"Jules Park",body:"I came along with an idea for a poster and ended up helping plan a supper.",published:0}],
  reports: [],
};
function PreviewGuide() {
  const groups = [
    {title:"Public website",links:[["Home","/","CAN / OPY, JOIN, BUILD and READ"],["What’s on","/events","Calendar and event details"],["Projects","/explore","Public projects and participation"],["People","/people","Opt-in profiles and approved notes"],["From Canopy","/updates","Official announcements"],["About","/about","About Canopy and partnerships"],["Get in touch","/contact","Private message to the team"],["Join","/join","Account application"],["Sign in","/signin","Member access"],["Privacy & community rules","/privacy","Visibility and community expectations"]]},
    {title:"Member area · sample content",links:[["Discussions","/preview","Conversations, replies and announcements"],["Ideas & projects","/preview/build","Ideas, interest and project creation"],["Project workspace","/preview/build/demo-project","Stages, ideas, polls, tasks and participants"],["Members","/preview/people","Connections and member profiles"],["Calendar","/preview/events","Events, details and RSVP"],["Messages","/preview/messages","Private conversations"],["Notifications","/preview/notifications","Updates and connection requests"],["Your profile","/preview/settings","Profile, public visibility and account settings"],["Admin","/preview/admin","Membership, publishing, inbox and review"]]},
  ];
  return <><PageHead title="A look around Canopy" text="Open any page below. Member examples are fictional and read only."/>{groups.map(group => <section className="preview-page-group" key={group.title}><h2>{group.title}</h2><div>{group.links.map(([title,href,text]) => <a key={href} href={href}><strong>{title}</strong><span>{text}</span></a>)}</div></section>)}</>;
}
export default function CanopyApp() {
  const initialPath = usePathname() || "/";
  const [snapshot, setSnapshot] = useState<{ scope: string; data: R; error: string }>({ scope: "", data: empty, error: "" });
  const route = usePageNavigation(initialPath, async (url, signal) => {
    const targetScope = url.pathname.startsWith("/preview") ? "preview" : url.pathname.startsWith("/community") ? "members" : "public";
    if (snapshot.scope === targetScope) return () => {};
    let nextData: R = sample;
    if (targetScope !== "preview") {
      const response = await fetch("/api?view=" + targetScope, { cache: "no-store", signal });
      nextData = await response.json() as R;
      if (!response.ok) throw new Error(nextData.error || "Unable to load Canopy.");
    }
    return () => setSnapshot({ scope: targetScope, data: nextData, error: "" });
  });
  const [path, search = ""] = route.split("?");
  const preview = path.startsWith("/preview");
  const community = preview || path.startsWith("/community");
  const base = preview ? "/preview" : "/community";
  const scope = preview ? "preview" : community ? "members" : "public";
  const requestId = useRef(0);
  const data = snapshot.scope === scope ? snapshot.data : empty;
  const loading = snapshot.scope !== scope;
  const error = snapshot.scope === scope ? snapshot.error : "";
  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    if (preview) {
      setSnapshot({ scope, data: sample, error: "" });
      return;
    }
    try {
      const r = await fetch("/api?view=" + (community ? "members" : "public"), { cache: "no-store" });
      const d = (await r.json()) as R;
      if (!r.ok) throw new Error(d.error || "Unable to load Canopy.");
      if (id === requestId.current) setSnapshot({ scope, data: d, error: "" });
    } catch (e) {
      if (id === requestId.current) setSnapshot((previous) => ({ scope, data: previous.scope === scope ? previous.data : empty, error: (e as Error).message }));
    }
  }, [preview, community, scope]);
  useEffect(() => {
    void Promise.resolve().then(refresh);
    return () => { requestId.current++; };
  }, [refresh]);
  const act = useCallback(
    async (action: string, body: R = {}) => {
      if (preview)
        throw new Error(
          "This is a read-only sample. Create an account to use Canopy.",
        );
      const r = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, action }),
      });
      const d = (await r.json()) as R;
      if (!r.ok) throw new Error(d.error || "Unable to save.");
      await refresh();
      return d;
    },
    [preview, refresh],
  );
  useEffect(() => {
    if (!community || preview || !data.user) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 30000);
    return () => clearInterval(timer);
  }, [community, preview, data.user, refresh]);
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: unknown,
            options: { signal: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!context?.registerTool || !community || preview || data.user?.status !== "active") return;
    const controller = new AbortController();
    try {
      Promise.resolve(
        context.registerTool(
          {
            name: "canopy_share_idea",
            title: "Share an idea with Canopy",
            description:
              "Create a member-visible idea in Canopy and update the current community state. Requires approved membership.",
            inputSchema: {
              type: "object",
              properties: {
                title: { type: "string", minLength: 1, maxLength: 160 },
                body: { type: "string", minLength: 1, maxLength: 8000 },
              },
              required: ["title", "body"],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false, untrustedContentHint: true },
            execute: async (input: unknown) => {
              const v = input as R;
              if (
                !v ||
                typeof v.title !== "string" ||
                !v.title.trim() ||
                v.title.length > 160 ||
                typeof v.body !== "string" ||
                !v.body.trim() ||
                v.body.length > 8000 ||
                Object.keys(v).some((k) => !["title", "body"].includes(k))
              )
                throw new Error("Provide a title and body.");
              const r = await act("post", {
                title: v.title,
                body: v.body,
                kind: "idea",
                visibility: "members",
              });
              return { id: r.id, created: true };
            },
          },
          { signal: controller.signal },
        ),
      ).catch(() => {});
    } catch {}
    return () => controller.abort();
  }, [act, community, preview, data.user?.status]);
  let view: React.ReactNode;
  if (community) {
    const route = path.slice(base.length).replace(/^\//, "");
    view = loading ? (
      <div className="loading">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-64 w-full mt-8" />
      </div>
    ) : error ? (
      <div className="gate">
        <h2>Canopy couldn’t load.</h2>
        <p>{error}</p>
        <button className="button" onClick={refresh}>
          Try again
        </button>
      </div>
    ) : data.user?.status !== "active" ? (
      <PublicationFrame>
        <Gate />
      </PublicationFrame>
    ) : (
      <Shell>
        {route === "" ? (
          <CommunityHome />
        ) : route === "guide" ? (
          <PreviewGuide />
        ) : route === "people" ? (
          <People />
        ) : route === "conversations" ? (
          <Conversations />
        ) : route === "build" ? (
          <Build />
        ) : route.startsWith("build/") ? (
          <ProjectDetail id={route.split("/")[1]} />
        ) : route === "events" ? (
          <Events />
        ) : route === "messages" ? (
          <Messages />
        ) : route === "notifications" ? (
          <Notifications />
        ) : route === "settings" ? (
          <SettingsPage />
        ) : route === "admin" ? (
          <Admin />
        ) : (
          <Empty title="Page not found." />
        )}
      </Shell>
    );
  } else {
    view = (
      <PublicationFrame>
        {error && (
          <div className="error-banner" role="alert">
            We couldn’t load the latest content.{" "}
            <button onClick={refresh}>Try again</button>
          </div>
        )}
        {path === "/" ? (
          <PublicHome />
        ) : path === "/about" ? (
          <PublicAbout />
        ) : path === "/join" ? (
          <AuthPage join />
        ) : path === "/signin" ? (
          <AuthPage />
        ) : path === "/contact" ? (
          <Contact />
        ) : path === "/people" ? (
          <People publicView />
        ) : path === "/events" ? (
          <Events />
        ) : path === "/updates" ? (
          <PublicUpdates />
        ) : path.startsWith("/explore/") ? (
          <PublicProject id={path.split("/")[2]} />
        ) : path === "/explore" ? (
          <Explore />
        ) : path === "/privacy" ? (
          <Privacy />
        ) : path === "/setup" ? (
          <Setup />
        ) : (
          <div className="gate">
            <h1>Page not found.</h1>
            <a href="/">Back to Canopy</a>
          </div>
        )}
      </PublicationFrame>
    );
  }
  return (
    <AppContext.Provider
      value={{ data, path, search, loading, error, preview, community, base, refresh, act }}
    >
      {view}
      <Toaster theme="light" richColors closeButton />
    </AppContext.Provider>
  );
}
