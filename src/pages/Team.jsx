import DisplayImage from "../components/DisplayImage";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { FaLinkedin, FaGithub, FaBehance } from "react-icons/fa";
import { usePageContent } from "../hooks/usePageContent";
import { usePublicCollection } from "../hooks/usePublicCollection";
import { fetchCoreTeamMembers } from "../lib/contentApi";
import "./team-scrapbook.css";
import { memberLinks } from "../lib/memberLinks";
const socialIcons = { linkedin: FaLinkedin, github: FaGithub, behance: FaBehance };

const rotations = [-2, 1.5, -1.5, 2, -2, 1];
const tapeColors = ["#d9e3c9", "#d4deec", "#ead8cf", "#ded3e9", "#e9e1c1"];

export function TeamPolaroid({ member, index, original = false }) {
  const reduce = useReducedMotion();
  const content = usePageContent("team");
  const [failedImage, setFailedImage] = useState("");
  const initials = member.name.split(" ").filter(Boolean).map(word => word[0]).slice(0, 2).join("");
  const profiles = memberLinks(member);
  return (
    <Motion.article className={`team-print ${original ? "team-print-original" : ""}`} style={{ "--print-angle": `${rotations[index % rotations.length]}deg`, "--tape-color": tapeColors[index % tapeColors.length] }} initial={reduce ? false : { opacity: 0, transform: "translateY(12px)" }} whileInView={{ opacity: 1, transform: "translateY(0)" }} viewport={{ once: true, amount: .1 }} transition={{ duration: .28, delay: (index % 3) * .045, ease: [.23, 1, .32, 1] }}>
      <div className="team-print-paper">
        <span className="team-print-tape" aria-hidden="true" />
        <div className="team-print-photo">
          {member.image && failedImage !== member.image ? <DisplayImage src={member.image} settings={member.image_display} placement="member" alt={`Portrait of ${member.name}`} width="600" height="600" loading={original && index < 3 ? "eager" : "lazy"} decoding="async" onError={() => setFailedImage(member.image)} /> : <div className="team-print-fallback" role="img" aria-label={`Photo unavailable for ${member.name}`}><span aria-hidden="true">{initials}</span></div>}
        </div>
        <div className="team-print-caption"><span className="team-print-stamp">{original ? content.originals.badge : content.core.badge}</span><h3>{member.name}</h3><p>{member.role}</p></div>
        <div className="team-print-footer">{profiles.length ? <div className="team-member-links">{profiles.map(({ network, label, href }) => { const Icon = socialIcons[network]; return <a key={network} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on ${label} (opens in a new tab)`} title={label}><Icon aria-hidden="true" /><span className="sr-only">{label}</span></a>; })}</div> : <span className="team-print-community">CodeCrafters</span>}</div>
      </div>
    </Motion.article>
  );
}

export default function Team() {
  const content = usePageContent("team");
  const ogTeamMembers = content.originals.items;
  const collection = usePublicCollection('team', fetchCoreTeamMembers);
  const members = collection.data;
  const status = collection.loading ? 'loading' : collection.error ? 'error' : 'ready';
  return (
    <div className="team-board">
      <div className="team-board-shell">
        <header className="team-board-intro"><h1>{content.intro.title}</h1><p>{content.intro.description}</p></header>
        <section hidden={!content.originals.enabled} className="team-board-section" aria-labelledby="team-originals">
          <div className="team-board-heading"><h2 id="team-originals">{content.originals.title}</h2><span>{ogTeamMembers.length} {content.originals.description}</span></div>
          <div className="team-board-grid">{ogTeamMembers.map((member, index) => <TeamPolaroid key={member.name} member={member} index={index} original />)}</div>
        </section>
        <section hidden={!content.core.enabled} className="team-board-section team-board-core" aria-labelledby="team-core" aria-busy={status === "loading"}>
          <div className="team-board-heading"><h2 id="team-core">{content.core.title}</h2><span>{content.core.description}</span></div>
          {status === "loading" && <div className="team-board-grid" role="status"><span className="sr-only">Loading core members</span>{[0, 1, 2].map(index => <div className="team-board-skeleton" key={index} aria-hidden="true"><div /><span /><span /></div>)}</div>}
          {status === "error" && <div className="team-board-notice" role="alert"><h3>The core team couldn’t load.</h3><p>Please try again to see our current members.</p><button onClick={() => { collection.refresh(); }}>Try again</button></div>}
          {status === "ready" && (members.length ? <div className={`team-board-grid ${members.length === 1 ? "team-board-grid-single" : ""}`}>{members.map((member, index) => <TeamPolaroid key={member.id || member.name} member={member} index={index + 2} />)}</div> : <div className="team-board-notice"><h3>{content.core.emptyTitle}</h3><p>{content.core.emptyDescription}</p></div>)}
        </section>
      </div>
    </div>
  );
}
