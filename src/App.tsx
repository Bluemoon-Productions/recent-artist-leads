import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Disc3,
  Instagram,
  LockKeyhole,
  Mail,
  Music2,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Upload,
  Youtube,
} from "lucide-react";
import starterArtists from "./data/artists.json";
import type { Artist, LocalAccount, ReleaseStatus } from "./types";

const ARTISTS_KEY = "radar-artists-v1";
const ACCOUNTS_KEY = "radar-local-accounts-v1";
const SESSION_KEY = "radar-local-session-v1";

type Screen = "home" | "auth" | "dashboard";
type AuthMode = "login" | "signup";

function readArtists(): Artist[] {
  const saved = localStorage.getItem(ARTISTS_KEY);
  return saved ? JSON.parse(saved) as Artist[] : starterArtists as Artist[];
}

function formatFollowers(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}k`;
  return String(value);
}

function safeUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function externalLink(value: string, label: string) {
  const url = safeUrl(value);
  return url ? (
    <a className="table-link" href={url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${label} in a new tab`}>
      {label}<ArrowUpRight size={13} />
    </a>
  ) : <span className="muted-cell">—</span>;
}

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function passwordDigest(password: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 310_000, hash: "SHA-256" }, key, 256);
  return toBase64(new Uint8Array(bits));
}

function validArtist(value: unknown): value is Artist {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return ["id", "name", "community", "niche", "area", "state", "releaseTitle", "releaseType", "releaseStatus", "releaseDate"]
    .every((key) => typeof item[key] === "string")
    && typeof item.followers === "number"
    && item.followers >= 0
    && ["instagram", "youtube", "spotify", "source", "mobile", "email", "management"]
      .every((key) => typeof item[key] === "string")
    && ["Single", "Album", "EP", "Music video"].includes(String(item.releaseType))
    && ["Announced", "Upcoming", "Released"].includes(String(item.releaseStatus))
    && /^\d{4}-\d{2}-\d{2}$/.test(String(item.releaseDate));
}

function App() {
  const [screen, setScreen] = useState<Screen>(() => localStorage.getItem(SESSION_KEY) ? "dashboard" : "home");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [busy, setBusy] = useState(false);
  const [artists, setArtists] = useState<Artist[]>(readArtists);
  const [query, setQuery] = useState("");
  const [community, setCommunity] = useState("");
  const [niche, setNiche] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [minFollowers, setMinFollowers] = useState("");
  const [maxFollowers, setMaxFollowers] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [releaseFilter, setReleaseFilter] = useState<"All releases" | ReleaseStatus>("All releases");
  const [notice, setNotice] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const filteredArtists = useMemo(() => artists.filter((artist) => {
    const text = `${artist.name} ${artist.community} ${artist.niche} ${artist.area} ${artist.state} ${artist.releaseTitle}`.toLowerCase();
    return (!query || text.includes(query.toLowerCase()))
      && (!community || artist.community === community)
      && (!niche || artist.niche === niche)
      && (!stateFilter || artist.state === stateFilter)
      && (!minFollowers || artist.followers >= Number(minFollowers))
      && (!maxFollowers || artist.followers <= Number(maxFollowers))
      && (!dateFrom || artist.releaseDate >= dateFrom)
      && (!dateTo || artist.releaseDate <= dateTo)
      && (releaseFilter === "All releases" || artist.releaseStatus === releaseFilter);
  }).sort((left, right) => right.releaseDate.localeCompare(left.releaseDate)), [artists, community, dateFrom, dateTo, maxFollowers, minFollowers, niche, query, releaseFilter, stateFilter]);

  const announcedCount = artists.filter((artist) => artist.releaseStatus !== "Released").length;
  const states = [...new Set(artists.map((artist) => artist.state))].sort();
  const communities = [...new Set(artists.map((artist) => artist.community))].sort();
  const niches = [...new Set(artists.map((artist) => artist.niche))].sort();

  function persistArtists(next: Artist[]) {
    localStorage.setItem(ARTISTS_KEY, JSON.stringify(next));
    setArtists(next);
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");
    setBusy(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "[]") as LocalAccount[];
      if (authMode === "signup") {
        if (accounts.some((account) => account.email === normalizedEmail)) {
          setAuthError("An account for this email already exists on this browser.");
          return;
        }
        const salt = crypto.getRandomValues(new Uint8Array(16));
        accounts.push({ email: normalizedEmail, salt: toBase64(salt), passwordHash: await passwordDigest(password, salt) });
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      } else {
        const account = accounts.find((item) => item.email === normalizedEmail);
        if (!account || await passwordDigest(password, fromBase64(account.salt)) !== account.passwordHash) {
          setAuthError("Email or password is incorrect. Accounts are saved only in this browser.");
          return;
        }
      }
      localStorage.setItem(SESSION_KEY, normalizedEmail);
      setScreen("dashboard");
      setPassword("");
    } catch (error) {
      setAuthError(error instanceof Error ? `Could not save your local account: ${error.message}` : "Could not save your local account.");
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setScreen("home");
  }

  async function importArtists(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!Array.isArray(parsed) || !parsed.every(validArtist)) {
        throw new Error("Expected a JSON array of artists. Check the sample file and required fields.");
      }
      const merged = [...artists];
      for (const artist of parsed as Artist[]) {
        const index = merged.findIndex((existing) => existing.id === artist.id);
        if (index >= 0) merged[index] = artist;
        else merged.push(artist);
      }
      persistArtists(merged);
      setNotice(`Imported ${parsed.length} record${parsed.length === 1 ? "" : "s"}. Data is saved in this browser.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not read that JSON file.");
    } finally {
      event.target.value = "";
    }
  }

  function exportArtists() {
    const blob = new Blob([JSON.stringify(artists, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "radar-artists.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function enterAuth(mode: AuthMode) {
    setAuthMode(mode);
    setAuthError("");
    setScreen("auth");
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="wordmark" href="#home" onClick={(event) => { event.preventDefault(); setScreen("home"); }} aria-label="Radar home">
          <span className="brand-mark"><Disc3 size={21} strokeWidth={2.2} /></span>radar<span className="wordmark-period">.</span>
        </a>
        {screen === "dashboard" ? (
          <div className="header-right">
            <span className="local-badge"><span />Local workspace</span>
            <button className="text-button" onClick={logout}>Sign out <ArrowUpRight size={14} /></button>
          </div>
        ) : (
          <nav className="header-right">
            <a className="nav-link" href="#about" onClick={(event) => { event.preventDefault(); document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }); }}>About</a>
            {screen === "auth" ? (
              <button className="button button-dark button-small" onClick={() => setScreen("home")}>Back home</button>
            ) : (
              <>
                <button className="text-button" onClick={() => enterAuth("login")}>Log in</button>
                <button className="button button-dark button-small" onClick={() => enterAuth("signup")}>Create account <ArrowUpRight size={14} /></button>
              </>
            )}
          </nav>
        )}
      </header>

      {screen === "home" && <Home onStart={() => enterAuth("signup")} />}
      {screen === "auth" && (
        <main className="auth-page">
          <div className="auth-orbit"><Disc3 size={178} strokeWidth={0.75} /><span>INDEPENDENT<br />BY DESIGN</span></div>
          <section className="auth-card">
            <span className="eyebrow"><LockKeyhole size={13} /> YOUR WORKSPACE</span>
            <h1>{authMode === "login" ? "Welcome back." : "Make some room."}</h1>
            <p className="auth-intro">{authMode === "login" ? "Pick up where your next discovery begins." : "Create a local account to start building your artist list."}</p>
            <form onSubmit={handleAuth} className="auth-form">
              <label>Email address<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@studio.com" /></label>
              <label>Password<input type="password" autoComplete={authMode === "login" ? "current-password" : "new-password"} required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></label>
              {authError && <p className="form-error" role="alert">{authError}</p>}
              <button className="button button-orange auth-submit" disabled={busy}>{busy ? "One moment…" : authMode === "login" ? "Log in" : "Create account"} <ArrowRight size={16} /></button>
            </form>
            <p className="auth-switch">{authMode === "login" ? "New around here?" : "Already have an account?"} <button onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthError(""); }}>{authMode === "login" ? "Create an account" : "Log in"}</button></p>
            <div className="auth-notice"><ShieldCheck size={16} /><span>This prototype saves a password hash and session in this browser only. It is not production authentication.</span></div>
          </section>
        </main>
      )}

      {screen === "dashboard" && (
        <main className="dashboard">
          <div className="dashboard-top">
            <div>
              <button className="back-link" onClick={() => setScreen("home")}><ArrowLeft size={14} /> Back to overview</button>
              <span className="eyebrow dashboard-eyebrow"><span className="eyebrow-dot" /> ARTIST INTELLIGENCE / INDIA</span>
              <h1>Find your next<br /><span>collaboration.</span></h1>
              <p>Artist profiles and release leads, organized for the first conversation.</p>
            </div>
            <div className="dashboard-counter"><span>RELEASE LEADS</span><strong>{String(announcedCount).padStart(2, "0")}</strong><small>announced &amp; upcoming</small></div>
          </div>

          <div className="prototype-notice"><span>DEMO DATA</span> These example records are fictional. Import your verified artist data to get started; releases and contact details are not automatically sourced.</div>
          <section className="workspace-card">
            <div className="workspace-heading">
              <div><h2>Artist directory</h2><p>Filter artist profiles, release dates and outreach details.</p></div>
              <div className="data-actions">
                <input ref={fileInput} className="visually-hidden" type="file" accept=".json,application/json" onChange={importArtists} />
                <button className="button button-outline" onClick={() => fileInput.current?.click()}><Upload size={15} /> Import JSON</button>
                <button className="button button-dark" onClick={exportArtists}><ArrowDown size={15} /> Export list</button>
              </div>
            </div>
            {notice && <div className="inline-notice" role="status">{notice}<button onClick={() => setNotice("")}>Dismiss</button></div>}

            <div className="filter-toolbar">
              <label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search artist, city or sound…" /></label>
              <span className="filter-caption"><SlidersHorizontal size={14} /> FILTERS</span>
              <select aria-label="Filter by community" value={community} onChange={(event) => setCommunity(event.target.value)}><option value="">All communities</option>{communities.map((item) => <option key={item}>{item}</option>)}</select>
              <select aria-label="Filter by niche" value={niche} onChange={(event) => setNiche(event.target.value)}><option value="">All niches</option>{niches.map((item) => <option key={item}>{item}</option>)}</select>
              <select aria-label="Filter by state" value={stateFilter} onChange={(event) => setStateFilter(event.target.value)}><option value="">All states</option>{states.map((item) => <option key={item}>{item}</option>)}</select>
            </div>
            <div className="filter-toolbar secondary-filters">
              <label className="range-input">Followers <input type="number" min="0" placeholder="Min" value={minFollowers} onChange={(event) => setMinFollowers(event.target.value)} /><span>to</span><input type="number" min="0" placeholder="Max" value={maxFollowers} onChange={(event) => setMaxFollowers(event.target.value)} /></label>
              <label className="date-input">Release date <input aria-label="Release date from" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /><span>to</span><input aria-label="Release date to" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} /></label>
              <select aria-label="Filter by release status" value={releaseFilter} onChange={(event) => setReleaseFilter(event.target.value as "All releases" | ReleaseStatus)}><option>All releases</option><option>Announced</option><option>Upcoming</option><option>Released</option></select>
              <button className="reset-button" onClick={() => { setQuery(""); setCommunity(""); setNiche(""); setStateFilter(""); setMinFollowers(""); setMaxFollowers(""); setDateFrom(""); setDateTo(""); setReleaseFilter("All releases"); }}>Reset filters</button>
            </div>

            <div className="results-bar"><span><strong>{filteredArtists.length}</strong> {filteredArtists.length === 1 ? "artist" : "artists"} found</span><span>Release date · newest first</span></div>
            <div className="table-scroll">
              <table>
                <thead><tr><th>ARTIST / RELEASE</th><th>COMMUNITY · SOUND</th><th>LOCATION</th><th>FOLLOWERS</th><th>RELEASE</th><th>SOCIALS</th><th>ANNOUNCEMENT</th><th>CONTACT</th></tr></thead>
                <tbody>
                  {filteredArtists.length ? filteredArtists.map((artist) => (
                    <tr key={artist.id}>
                      <td><div className="artist-cell"><span className="artist-avatar">{artist.name.split(/[\s—-]+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span><div><strong>{artist.name}</strong><span>{artist.releaseTitle}</span>{artist.isDemo && <small className="demo-tag">EXAMPLE</small>}</div></div></td>
                      <td><strong className="cell-primary">{artist.community}</strong><span className="cell-secondary">{artist.niche}</span></td>
                      <td><strong className="cell-primary">{artist.area}</strong><span className="cell-secondary">{artist.state}</span></td>
                      <td><span className="followers">{formatFollowers(artist.followers)}</span></td>
                      <td><span className="release-type">{artist.releaseType}</span></td>
                      <td><div className="social-links">{externalLink(artist.instagram, "IG")}{externalLink(artist.youtube, "YT")}{externalLink(artist.spotify, "SP")}</div></td>
                      <td><div className="release-date-cell"><span className={`status-pill status-${artist.releaseStatus.toLowerCase()}`}>{artist.releaseStatus}</span><span>{new Date(`${artist.releaseDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>{artist.source && externalLink(artist.source, "View source")}</div></td>
                      <td><div className="contact-cell">{artist.email ? <a href={`mailto:${artist.email}`}>{artist.email}</a> : <span>—</span>}{artist.mobile && <a href={`tel:${artist.mobile}`}>{artist.mobile}</a>}{artist.management && <span>{artist.management}</span>}</div></td>
                    </tr>
                  )) : <tr><td className="empty-cell" colSpan={8}><div><Search size={22} /><strong>No artists match these filters.</strong><span>Try adjusting a filter or import an artist JSON file.</span></div></td></tr>}
                </tbody>
              </table>
            </div>
            <div className="table-footnote"><ShieldCheck size={14} /> Only use contact details shared publicly or with permission. Verify every release announcement at its source before outreach.</div>
          </section>
          <footer className="dashboard-footer"><a className="wordmark" href="#home" onClick={(event) => { event.preventDefault(); setScreen("home"); }}><span className="brand-mark"><Disc3 size={18} /></span>radar<span className="wordmark-period">.</span></a><span>Built for better first listens. © {new Date().getFullYear()} Radar</span><span>Research thoughtfully. Reach out respectfully.</span></footer>
        </main>
      )}
    </div>
  );
}

function Home({ onStart }: { onStart: () => void }) {
  return (
    <>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> A BETTER WAY INTO WHAT'S NEXT</span>
            <h1>Find the sound<br />before <span>the noise.</span></h1>
            <p className="hero-description">A thoughtful starting point for discovering independent Indian artists and the music they’re about to share.</p>
            <div className="hero-actions"><button className="button button-orange" onClick={onStart}>Explore the directory <ArrowUpRight size={16} /></button><a className="learn-link" href="#about">Meet Radar <ArrowDownRight size={16} /></a></div>
            <div className="hero-note"><span className="avatar-stack"><i>♪</i><i>र</i><i>↗</i></span><span>For the people who make<br />music move forward.</span></div>
          </div>
          <div className="hero-art" aria-label="Abstract record illustration">
            <div className="art-stamp">SIDE A<br />THE NEXT WAVE</div>
            <div className="record record-one"><div className="record-lines" /><div className="record-label"><span>RADAR</span><Music2 size={26} /><small>INDIA · 01</small></div></div>
            <div className="art-ticket"><span>ON REPEAT</span><strong>Independent<br />sounds, closer.</strong><ArrowUpRight size={17} /></div>
            <span className="art-sparkle sparkle-one">✳</span><span className="art-sparkle sparkle-two">✳</span>
            <div className="art-coordinates">19°04′ N<br />72°52′ E</div>
          </div>
          <div className="hero-bottom"><span>DISCOVER DIFFERENTLY</span><span>INDIA, IN EVERY FREQUENCY</span><span>SCROLL TO TUNE IN <ArrowDown size={13} /></span></div>
        </section>

        <section className="intro-section" id="about">
          <div className="section-index">01 / THE IDEA</div>
          <div className="intro-content"><span className="eyebrow">A LITTLE LESS SEARCHING. A LOT MORE LISTENING.</span><h2>The next great<br />collaboration is<br /><span>already out there.</span></h2></div>
          <div className="intro-aside"><p>But finding the right independent musician—and knowing when they have something new to share—can take hours across scattered platforms.</p><p>Radar brings your research into one considered workspace, so you can spend less time digging and more time making a genuine connection.</p><a href="#how" className="underlined-link">How it works <ArrowDownRight size={15} /></a></div>
        </section>

        <section className="how-section" id="how">
          <div className="how-heading"><div><span className="eyebrow">02 / YOUR NEW ROUTINE</span><h2>Good things<br />come into focus.</h2></div><p>Search with intention. Follow the lead.<br />Start a better conversation.</p></div>
          <div className="steps-grid">
            <article className="step-card"><span className="step-number">01</span><div className="step-icon"><Search size={21} /></div><h3>Find your people.</h3><p>Filter by community, genre, city, state and follower range to find the artists that fit your brief.</p><span className="step-meta">COMMUNITY · SOUND · PLACE</span></article>
            <article className="step-card"><span className="step-number">02</span><div className="step-icon"><Disc3 size={21} /></div><h3>Catch the next release.</h3><p>Sort announced, upcoming and released music by date. Verify every lead against its original source.</p><span className="step-meta">SINGLES · EPs · ALBUMS · VIDEO</span></article>
            <article className="step-card"><span className="step-number">03</span><div className="step-icon"><ArrowUpRight size={21} /></div><h3>Make it personal.</h3><p>Keep profiles, official links and publicly shared contact details together. Reach out with context.</p><span className="step-meta">A THOUGHTFUL FIRST HELLO</span></article>
          </div>
        </section>

        <section className="manifesto">
          <span className="eyebrow"><Sparkles size={14} /> THE RADAR POINT OF VIEW</span>
          <h2>More signal.<br /><span>Less noise.</span></h2>
          <p>Discovery should open doors, not send another cold email. We help teams notice the music, find the source and approach artists like people—not leads on a spreadsheet.</p>
          <div className="manifesto-graphic"><span>LISTEN</span><i /><span>LEARN</span><i /><span>REACH OUT</span></div>
        </section>

        <section className="closing-cta">
          <div className="cta-orbit"><Disc3 size={99} strokeWidth={0.8} /><span>YOUR<br />NEXT<br />FAVORITE</span></div>
          <div><span className="eyebrow">03 / YOUR NEXT LISTEN</span><h2>Find the artist.<br />Follow the feeling.</h2><p>Open the directory and start with what you’re looking for.</p></div>
          <button className="button button-dark cta-button" onClick={onStart}>Check artist data now <ArrowUpRight size={16} /></button>
        </section>
      </main>
      <footer className="site-footer"><a className="wordmark" href="#home"><span className="brand-mark"><Disc3 size={18} /></span>radar<span className="wordmark-period">.</span></a><p>Independent music deserves to be found.<br />Made with care, for the ones who listen.</p><div className="footer-social"><a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={17} /></a><a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><Youtube size={18} /></a><a href="mailto:hello@radar.example" aria-label="Email Radar"><Mail size={17} /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} RADAR. ALL RIGHTS RESERVED.</span><span>BUILT FOR THE MUSIC, NOT THE ALGORITHM.</span><a href="#about">ABOUT US <ArrowUpRight size={12} /></a></div></footer>
    </>
  );
}

export default App;
