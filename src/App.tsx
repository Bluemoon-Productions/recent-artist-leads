import { useState, type FormEvent } from "react";
import {
  ArrowDownRight,
  ArrowDown,
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
  Sparkles,
  Youtube,
} from "lucide-react";
import type { Artist, LocalAccount } from "./types";
import { buildPlatformSearchUrl, type SearchProvider } from "./lib/platform-search";

const ACCOUNTS_KEY = "radar-local-accounts-v1";
const SESSION_KEY = "radar-local-session-v1";

type Screen = "home" | "auth" | "dashboard";
type AuthMode = "login" | "signup";

function safeUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function externalLink(value: string | undefined, label: string) {
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

function App() {
  const [screen, setScreen] = useState<Screen>(() => localStorage.getItem(SESSION_KEY) ? "dashboard" : "home");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [busy, setBusy] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [provider, setProvider] = useState<"musicbrainz" | SearchProvider>("youtube");
  const [query, setQuery] = useState("");
  const [community, setCommunity] = useState("");
  const [niche, setNiche] = useState("indie");
  const [areaFilter, setAreaFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [totalMatches, setTotalMatches] = useState(0);
  const [externalSearchUrl, setExternalSearchUrl] = useState("");

  async function searchArtists(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (provider === "instagram" && dateFrom && dateTo && dateFrom > dateTo) {
      setArtists([]);
      setTotalMatches(0);
      setExternalSearchUrl("");
      setSearchError("The start date must be on or before the end date.");
      return;
    }
    setSearchError("");
    setArtists([]);
    setTotalMatches(0);
    setExternalSearchUrl("");
    setSearching(true);
    setHasSearched(true);
    try {
      if (provider !== "musicbrainz") {
        setExternalSearchUrl(buildPlatformSearchUrl(provider, {
          query: query.trim(),
          community: community.trim(),
          niche: niche.trim(),
          area: areaFilter.trim(),
          dateFrom,
          dateTo,
        }));
        return;
      }

      const params = new URLSearchParams();
      if (query.trim()) params.set("query", query.trim());
      if (community.trim()) params.set("community", community.trim());
      if (niche.trim()) params.set("niche", niche.trim());
      if (areaFilter.trim()) params.set("area", areaFilter.trim());
      const response = await fetch(`/api/artists?${params.toString()}`);
      const result = await response.json() as { artists?: Artist[]; total?: number; error?: string };
      if (!response.ok) throw new Error(result.error ?? `Artist search failed (HTTP ${response.status}).`);
      setArtists(result.artists ?? []);
      setTotalMatches(result.total ?? 0);
    } catch (error) {
      setArtists([]);
      setTotalMatches(0);
      setSearchError(error instanceof Error ? error.message : "Could not load live artist records.");
    } finally {
      setSearching(false);
    }
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
              <p>Search public music platforms for artists and release announcements.</p>
            </div>
            <div className="dashboard-counter"><span>{provider === "musicbrainz" ? "CATALOG RESULTS" : "SEARCH SOURCE"}</span><strong>{provider === "musicbrainz" ? String(artists.length).padStart(2, "0") : provider.toUpperCase()}</strong><small>{provider === "musicbrainz" ? "MusicBrainz records loaded" : "public search, opened separately"}</small></div>
          </div>

          <div className="prototype-notice"><span>LIVE SEARCH</span> Choose a platform to open its public search results, or search the optional MusicBrainz catalogue. No demo artist records are bundled here.</div>
          <section className="workspace-card">
            <div className="workspace-heading">
              <div><h2>Search music platforms</h2><p>Choose a source and search public artist or release pages.</p></div>
            </div>

            <form className="live-search-form" onSubmit={searchArtists}>
              <div className="filter-toolbar">
                <label className="live-filter"><span>Search on</span><select aria-label="Search platform" value={provider} onChange={(event) => { setProvider(event.target.value as "musicbrainz" | SearchProvider); setArtists([]); setExternalSearchUrl(""); setHasSearched(false); setSearchError(""); }}><option value="youtube">YouTube</option><option value="instagram">Instagram · public web results</option><option value="spotify">Spotify</option><option value="musicbrainz">MusicBrainz · optional</option></select></label>
                <label className="live-filter"><span>Artist name</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. Indian indie artist" /></label>
                <label className="live-filter"><span>Community tag</span><input value={community} onChange={(event) => setCommunity(event.target.value)} placeholder="e.g. Indian hip-hop" /></label>
                <label className="live-filter"><span>Niche / genre tag</span><input value={niche} onChange={(event) => setNiche(event.target.value)} placeholder="e.g. indie pop, rap" /></label>
                <label className="live-filter"><span>City / area / state</span><input value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)} placeholder="e.g. Mumbai, Maharashtra" /></label>
                <button className="button button-orange search-submit" disabled={searching}><Search size={15} /> {searching ? "Searching…" : provider === "musicbrainz" ? "Search catalogue" : "Prepare search link"}</button>
              </div>
              <div className="filter-toolbar live-filter-row">
                <label className="live-filter"><span>Indexed post date (Instagram only)</span><div className="paired-inputs"><input aria-label="Indexed post date from" type="date" disabled={provider !== "instagram"} value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /><span>to</span><input aria-label="Indexed post date to" type="date" disabled={provider !== "instagram"} value={dateTo} onChange={(event) => setDateTo(event.target.value)} /></div></label>
                <div className="live-filter search-provider-note"><span>Source behavior</span><p>{provider === "musicbrainz" ? "Searches catalogue records by name, tags and area. Date and follower filters are unavailable; it does not search social posts." : provider === "instagram" ? "Opens Google results limited to public, indexed Instagram pages. Date operators apply to indexed pages, not verified releases; follower counts are manual." : provider === "youtube" ? "Opens YouTube's public search page. Review channel/video descriptions and use YouTube's own upload-date filters; follower ranges are manual." : "Opens Spotify's public artist and music search. Release announcements, date and follower filters are unavailable."}</p></div>
              </div>
            </form>

            <div className="availability-note">
              <strong>Search limits:</strong> Platform searches open in a new tab; this site does not scrape, collect or store platform results. Follower counts must be checked on the artist profile. The optional date range is only for Google-indexed Instagram pages—not verified release dates. Check each original post/video before contacting an artist.
            </div>
            {searchError && <p className="form-error search-error" role="alert">{searchError}</p>}

            <div className="results-bar"><span>{provider === "musicbrainz" ? <><strong>{artists.length}</strong> {artists.length === 1 ? "artist found" : "artists found"}</> : <strong>{externalSearchUrl ? "Search ready" : "Choose a source"}</strong>}</span><span>{provider === "musicbrainz" && hasSearched ? `MusicBrainz catalogue: ${totalMatches.toLocaleString()} matching records · showing up to 100` : "Public platform search · no demo data"}</span></div>
            {externalSearchUrl && (
              <div className="external-search-card">
                <span className="external-search-icon">{provider === "youtube" ? <Youtube size={23} /> : provider === "instagram" ? <Instagram size={23} /> : <Music2 size={23} />}</span>
                <div><strong>{provider === "instagram" ? "Search public Instagram posts" : provider === "youtube" ? "Search YouTube videos and channels" : "Search Spotify artists and music"}</strong><p>Text filters are included. Results open on {provider === "instagram" ? "Google (public Instagram pages)" : provider === "youtube" ? "YouTube" : "Spotify"}; follower counts must be checked on profiles.</p></div>
                <a className="button button-dark" href={externalSearchUrl} target="_blank" rel="noopener noreferrer">Open search results <ArrowUpRight size={15} /></a>
              </div>
            )}
            {provider === "musicbrainz" && <div className="table-scroll">
              <table>
                <thead><tr><th>ARTIST</th><th>TYPE</th><th>ORIGIN AREA / COUNTRY</th><th>CATALOG TAGS</th><th>INSTAGRAM</th><th>YOUTUBE</th><th>SPOTIFY</th><th>CATALOG SOURCE</th></tr></thead>
                <tbody>
                  {provider === "musicbrainz" && artists.length ? artists.map((artist) => (
                    <tr key={artist.id}>
                      <td><div className="artist-cell"><span className="artist-avatar">{artist.name.split(/[\s—-]+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span><div><strong>{artist.name}</strong><span>MusicBrainz artist record</span></div></div></td>
                      <td><span className="cell-primary">{artist.type}</span></td>
                      <td><strong className="cell-primary">{artist.location || "Not listed"}</strong><span className="cell-secondary">{artist.country || "Country not listed"}</span></td>
                      <td><span className="tag-list">{artist.tags.length ? artist.tags.join(", ") : "No tags recorded"}</span></td>
                      <td>{externalLink(artist.instagram, "Instagram")}</td>
                      <td>{externalLink(artist.youtube, "YouTube")}</td>
                      <td>{externalLink(artist.spotify, "Spotify")}</td>
                      <td>{externalLink(artist.profileUrl, "MusicBrainz record")}</td>
                    </tr>
                  )) : <tr><td className="empty-cell" colSpan={8}><div><Search size={22} /><strong>{searchError ? "Live search didn’t complete." : provider !== "musicbrainz" && externalSearchUrl ? "Search results opened separately." : provider === "musicbrainz" && hasSearched ? "No catalogue records matched." : "Ready to search."}</strong><span>{searchError ? "Check your connection and try again." : provider !== "musicbrainz" && externalSearchUrl ? "Open the search results above. This app does not import results from other platforms." : provider === "musicbrainz" && hasSearched ? "Try a broader artist, tag or area filter. The catalogue is community-maintained and incomplete." : "Choose a platform and filters, then select “Search live data” to continue."}</span></div></td></tr>}
                </tbody>
              </table>
            </div>}
            <div className="table-footnote"><ShieldCheck size={14} /> Search platform results yourself and verify profile, release date and source before outreach. MusicBrainz catalogue results are available only when that provider is selected. <a href="https://musicbrainz.org/doc/MusicBrainz_API" target="_blank" rel="noopener noreferrer">MusicBrainz API</a>.</div>
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
            <p className="hero-description">A thoughtful starting point for finding Indian artists and release announcements across public music platforms.</p>
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
          <div className="intro-aside"><p>Finding independent musicians and release announcements can mean searching across scattered social platforms and incomplete catalogues.</p><p>Radar helps you build a focused public search across YouTube, Instagram, Spotify and an optional artist catalogue—without scraping or inventing missing details.</p><a href="#how" className="underlined-link">How it works <ArrowDownRight size={15} /></a></div>
        </section>

        <section className="how-section" id="how">
          <div className="how-heading"><div><span className="eyebrow">02 / YOUR NEW ROUTINE</span><h2>Good things<br />come into focus.</h2></div><p>Search the catalogue. Review the source.<br />Start with what’s actually available.</p></div>
          <div className="steps-grid">
            <article className="step-card"><span className="step-number">01</span><div className="step-icon"><Search size={21} /></div><h3>Find your people.</h3><p>Filter by community, genre, city, state and follower range to find the artists that fit your brief.</p><span className="step-meta">COMMUNITY · SOUND · PLACE</span></article>
            <article className="step-card"><span className="step-number">02</span><div className="step-icon"><Disc3 size={21} /></div><h3>Search where artists post.</h3><p>Open YouTube, Spotify and public web-indexed Instagram searches for artist and release keywords.</p><span className="step-meta">YOUTUBE · INSTAGRAM · SPOTIFY</span></article>
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
