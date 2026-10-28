import { motion as Motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaLinkedin, FaArrowUp } from "react-icons/fa";
import { usePageContent } from "../hooks/usePageContent";
import { fetchCoreTeamMembers } from "../lib/contentApi";
import "./team-scrapbook.css";

const rotations = [-2, 1.5, -1.5, 2, -2, 1];
const tapeColors = ["#d9e3c9", "#d4deec", "#ead8cf", "#ded3e9", "#e9e1c1"];

function Polaroid({ member, index, original = false }) {
  const reduce = useReducedMotion();
  const content = usePageContent("team");
  const [failedImage, setFailedImage] = useState("");
  const initials = member.name.split(" ").filter(Boolean).map(word => word[0]).slice(0, 2).join("");
  let profile;
  try {
    const url = new URL(member.linkedin);
    if (url.protocol === "https:" && (url.hostname === "linkedin.com" || url.hostname.endsWith(".linkedin.com"))) profile = url.href;
  } catch { /* A member without a valid profile remains a readable card. */ }
  return (
    <Motion.article className={`team-print ${original ? "team-print-original" : ""}`} style={{ "--print-angle": `${rotations[index % rotations.length]}deg`, "--tape-color": tapeColors[index % tapeColors.length] }} initial={reduce ? false : { opacity: 0, transform: "translateY(12px)" }} whileInView={{ opacity: 1, transform: "translateY(0)" }} viewport={{ once: true, amount: .1 }} transition={{ duration: .28, delay: (index % 3) * .045, ease: [.23, 1, .32, 1] }}>
      <div className="team-print-paper">
        <span className="team-print-tape" aria-hidden="true" />
        <div className="team-print-photo">
          {member.image && failedImage !== member.image ? <img src={member.image} alt={`Portrait of ${member.name}`} width="600" height="600" loading={original && index < 3 ? "eager" : "lazy"} decoding="async" onError={() => setFailedImage(member.image)} /> : <div className="team-print-fallback" role="img" aria-label={`Photo unavailable for ${member.name}`}><span aria-hidden="true">{initials}</span></div>}
        </div>
        <div className="team-print-caption"><span className="team-print-stamp">{original ? content.originals.badge : content.core.badge}</span><h3>{member.name}</h3><p>{member.role}</p></div>
        <div className="team-print-footer">{profile ? <a href={profile} target="_blank" rel="noopener noreferrer" aria-label={`Connect with ${member.name} on LinkedIn (opens in a new tab)`}><FaLinkedin aria-hidden="true" /><span>Connect</span><FaArrowUp className="team-print-arrow" aria-hidden="true" /></a> : <span className="team-print-community">CodeCrafters</span>}</div>
      </div>
    </Motion.article>
  );
}

export default function Team() {
  const content = usePageContent("team");
  const ogTeamMembers = content.originals.items;
  const [members, setMembers] = useState([]);
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    fetchCoreTeamMembers().then(data => { if (active) { setMembers(data); setStatus("ready"); } }).catch(() => { if (active) setStatus("error"); });
    return () => { active = false; };
  }, [attempt]);
  return (
    <div className="team-board">
      <div className="team-board-shell">
        <header className="team-board-intro"><h1>{content.intro.title}</h1><p>{content.intro.description}</p></header>
        <section hidden={!content.originals.enabled} className="team-board-section" aria-labelledby="team-originals">
          <div className="team-board-heading"><h2 id="team-originals">{content.originals.title}</h2><span>{ogTeamMembers.length} {content.originals.description}</span></div>
          <div className="team-board-grid">{ogTeamMembers.map((member, index) => <Polaroid key={member.name} member={member} index={index} original />)}</div>
        </section>
        <section hidden={!content.core.enabled} className="team-board-section team-board-core" aria-labelledby="team-core" aria-busy={status === "loading"}>
          <div className="team-board-heading"><h2 id="team-core">{content.core.title}</h2><span>{content.core.description}</span></div>
          {status === "loading" && <div className="team-board-grid" role="status"><span className="sr-only">Loading core members</span>{[0, 1, 2].map(index => <div className="team-board-skeleton" key={index} aria-hidden="true"><div /><span /><span /></div>)}</div>}
          {status === "error" && <div className="team-board-notice" role="alert"><h3>The core team couldn’t load.</h3><p>Please try again to see our current members.</p><button onClick={() => { setStatus("loading"); setAttempt(value => value + 1); }}>Try again</button></div>}
          {status === "ready" && (members.length ? <div className={`team-board-grid ${members.length === 1 ? "team-board-grid-single" : ""}`}>{members.map((member, index) => <Polaroid key={member.id || member.name} member={member} index={index + 2} />)}</div> : <div className="team-board-notice"><h3>{content.core.emptyTitle}</h3><p>{content.core.emptyDescription}</p></div>)}
        </section>
      </div>
    </div>
  );
}
