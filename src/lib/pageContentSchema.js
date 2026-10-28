import { normalizeFields, validateFields } from "./pageContentUtils";
export { safeContentLink, safeImage } from "./pageContentUtils";

import {
  heroData,
  aboutData,
  ogTeamMembers,
  contactData,
  socialLinks,
  domains,
  navLinks,
} from "../data/siteData";
const logo = "/brand/code-crafters.png";
const originalPortraits = [
  "maadhav",
  "vatsal",
  "kunal",
  "pinkesh",
  "anshul",
  "abdul",
];

const text = (label, value = "", type = "text") => ({
  label,
  type,
  default: value,
});
const area = (label, value) => text(label, value, "textarea");
const icon = (value) => text("Icon", value, "icon");
const link = (label, value) => text(label, value, "link");
const image = (label, value = "") => text(label, value, "image");
const toggle = (label, value = true) => ({
  label,
  type: "boolean",
  default: value,
});
const list = (label, fields, value) => ({
  label,
  type: "list",
  fields,
  default: value,
});
const section = (label, fields, visible = false) => ({
  label,
  fields: visible
    ? { enabled: toggle("Show this section"), ...fields }
    : fields,
});
const valueFields = {
  title: text("Title"),
  description: area("Description", ""),
  icon: icon("FaLightbulb"),
};
const values = aboutData.values.map((v, i) => ({
  title: v.title,
  description: v.description,
  icon: ["FaLightbulb", "FaHandshake", "FaGlobe"][i],
}));
const memberFields = {
  name: text("Name"),
  role: text("Role"),
  image: image("Portrait"),
  linkedin: link("LinkedIn URL", ""),
};
const header = (title, description) => ({
  title: text("Heading", title),
  description: area("Description", description),
});
const pillars = [
  {
    title: "Hackathons",
    description:
      "Intense, thrilling 24-hour coding sprints where our members form teams, brainstorm wild ideas, and build fully-functional prototypes overnight.",
    icon: "FaLaptopCode",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Open Source",
    description:
      "Contributing to the global tech ecosystem. We host bootcamps that teach members how to navigate GitHub, understand codebases, and make their first PRs.",
    icon: "FaHandsHelping",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Workshops",
    description:
      "Weekly deep dives into modern frameworks, cybersecurity, AI, and UI/UX design led by our own experienced members and guest industry speakers.",
    icon: "FaTools",
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Mentorship",
    description:
      "Pairing enthusiastic freshmen with senior developers to bridge the gap between academic theory and practical, industry-ready skills.",
    icon: "FaLaptopHouse",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Networking",
    description:
      "Building lifelong connections. From casual Friday pizza nights to formal tech symposiums, our community is all about the people you meet.",
    icon: "FaNetworkWired",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
  },
];

export const pageSchemas = {
  home: {
    label: "Home",
    path: "/",
    modules: ["testimonials", "album", "upcoming"],
    sections: {
      hero: section("Hero and animated domains", {
        badge: text("Badge", heroData.badge),
        title: text("Headline", heroData.title),
        highlight: text("Stamped headline", "CODE & COLLAB"),
        description: area("Introduction", heroData.subtitle),
        primaryLabel: text("Primary button", heroData.cta),
        primaryLink: link("Primary destination", "/about"),
        secondaryLabel: text("Second button", heroData.ctaSecondary),
        secondaryLink: link("Second destination", "/contact"),
        domains: list(
          "Animated domain stickers",
          { name: text("Label"), icon: icon("FaCode") },
          domains.map((v, i) => ({
            name: v.name,
            icon: ["FaCode", "FaBrain", "FaShieldAlt", "FaRocket", "FaLink"][i],
          })),
        ),
      }),
      values: section(
        "Our core values",
        {
          eyebrow: text("Small heading", "The Foundation"),
          title: text("Heading", "Our Core Values"),
          items: list("Values", valueFields, values),
        },
        true,
      ),
      stats: section(
        "Community highlights",
        {
          items: list(
            "Highlights",
            {
              value: text("Value"),
              label: text("Label"),
              icon: icon("FaUsers"),
            },
            [
              { value: "1500+", label: "Community Members", icon: "FaUsers" },
              {
                value: "20+",
                label: "Events Conducted",
                icon: "FaCalendarAlt",
              },
              { value: "5+", label: "Tech Domains", icon: "FaLaptopCode" },
            ],
          ),
        },
        true,
      ),
      albums: section(
        "Club life and culture",
        {
          eyebrow: text("Small heading", "Inside CodeCrafters"),
          ...header(
            "Club Life & Culture",
            "Photos and memories from our published community albums.",
          ),
          buttonLabel: text("Gallery button", "Explore all photos"),
          buttonLink: link("Gallery destination", "/gallery"),
        },
        true,
      ),
      testimonials: section(
        "Member feedback",
        {
          eyebrow: text("Small heading", "Community Voice"),
          ...header(
            "What People Say",
            "Hear from our members about how CodeCrafters has impacted their journey in tech.",
          ),
        },
        true,
      ),
      events: section(
        "Event preview",
        {
          buttonLabel: text("Events button", "Explore all events"),
          buttonLink: link("Events destination", "/events"),
          spotlightLabel: text("Spotlight heading", "On the calendar"),
          nextLabel: text("Next event label", "Next upcoming event"),
          allLabel: text("All events link", "All events"),
          exploreLabel: text("Explore button", "Explore event"),
          registerLabel: text("Registration button", "Register"),
        },
        true,
      ),
      invitation: section(
        "Closing invitation",
        {
          ...header(
            "Build with CodeCrafters",
            "Meet the community, explore our activities, and share what you would like to build.",
          ),
          buttonLabel: text("Join button", "Join Us"),
          buttonLink: link("Join destination", "/contact"),
          teamLabel: text("Team link", "Meet the team"),
          teamLink: link("Team destination", "/team"),
        },
        true,
      ),
    },
  },
  about: {
    label: "About",
    path: "/about",
    modules: [],
    sections: {
      origin: section("Origin letter", {
        eyebrow: text("Small heading", "Our Origin Story"),
        title: area("Heading", "The Story Behind\nCodeCrafters"),
        description: area("Introduction", aboutData.description),
        story: area("Story", aboutData.longDescription),
        continuation: area(
          "Second paragraph",
          "We started with a vision to build something greater than just a club. We wanted a community. A space where students don't just consume knowledge, but actively forge it. Today, we are proud to host",
        ),
        communitySize: text("Community size", aboutData.communitySize),
        communityLabel: text("Community label", aboutData.communitySizeLabel),
        ending: text("Closing phrase", "growing every single day."),
        signedLabel: text("Signature label", "Signed,"),
        signature: text("Signature", "The Foundry"),
      }),
      pillars: section(
        "Club pillars",
        {
          eyebrow: text("Small heading", "What We Build On"),
          ...header(
            "Our Core Pillars",
            "The foundation of our club experience. Hover over each pillar to explore the initiatives driving our community forward.",
          ),
          items: list(
            "Pillars",
            {
              title: text("Title"),
              description: area("Description", ""),
              icon: icon("FaTools"),
              image: image("Photo"),
            },
            pillars,
          ),
        },
        true,
      ),
      direction: section(
        "Mission and vision",
        {
          items: list("Statements", valueFields, [
            {
              title: "Our Mission",
              description: aboutData.mission,
              icon: "FaRocket",
            },
            {
              title: "Our Vision",
              description: aboutData.vision,
              icon: "FaEye",
            },
          ]),
        },
        true,
      ),
      values: section(
        "Core value tags",
        {
          title: text("Heading", "Our Core Values"),
          items: list("Values", valueFields, values),
        },
        true,
      ),
      whyJoin: section(
        "Why join checklist",
        {
          title: text("Heading", "Why Join Us?"),
          items: list(
            "Reasons",
            { text: area("Reason", "") },
            aboutData.whyJoin.map((v) => ({ text: v })),
          ),
        },
        true,
      ),
    },
  },
  events: {
    label: "Events",
    path: "/events",
    modules: ["upcoming", "album"],
    sections: {
      intro: section("Page headings", {
        title: text("Page title", "Events"),
        live: text("Live section", "Live now"),
        upcoming: text("Upcoming section", "Upcoming events"),
        past: text("Past section", "Past events"),
        unscheduled: text("Unscheduled section", "Schedule to be confirmed"),
        empty: text(
          "No upcoming events",
          "No upcoming events are announced yet.",
        ),
        galleryLabel: text("Gallery button", "Explore the gallery"),
        galleryLink: link("Gallery destination", "/gallery"),
        pastTitle: text("Albums heading", "The Photo Album"),
        eventPhotosLabel: text("Event photos link", "View event photos"),
      }),
    },
  },
  gallery: {
    label: "Gallery",
    path: "/gallery",
    modules: ["album"],
    sections: {
      intro: section("Photo archive", {
        eyebrow: text("Small heading", "The CodeCrafters gallery"),
        ...header(
          "Life, in frames.",
          "The people, projects, and shared moments behind the code. Explore the CodeCrafters photo archive, one frame at a time.",
        ),
        archiveEyebrow: text("Archive small heading", "Browse the collection"),
        archiveTitle: text("Archive heading", "The archive"),
        hint: text("Archive hint", "Select a frame to explore"),
        searchLabel: text("Search label", "Search the archive"),
        searchPlaceholder: text(
          "Search placeholder",
          "Search photos, captions, or events",
        ),
        emptyTitle: text("Empty results heading", "No frames found"),
        emptyDescription: area(
          "Empty archive message",
          "Published community albums will appear here.",
        ),
      }),
    },
  },
  team: {
    label: "Team",
    path: "/team",
    modules: ["team"],
    sections: {
      intro: section(
        "Page introduction",
        header(
          "The people behind CodeCrafters.",
          "Different minds. Shared curiosity. A community built together.",
        ),
      ),
      originals: section(
        "Original team",
        {
          title: text("Heading", "The originals"),
          description: text("Description", "people who started it all"),
          badge: text("Photo badge", "The OG'S"),
          items: list(
            "Original members",
            memberFields,
            ogTeamMembers.map((member, index) => ({
              ...member,
              image: `/team/${originalPortraits[index]}.jpg`,
            })),
          ),
        },
        true,
      ),
      core: section(
        "Core team",
        {
          title: text("Heading", "Core team"),
          description: text("Description", "Keeping the ideas moving"),
          badge: text("Photo badge", "Core Team"),
          emptyTitle: text("Empty heading", "More faces to come."),
          emptyDescription: text(
            "Empty description",
            "Our current core team will appear here once announced.",
          ),
        },
        true,
      ),
    },
  },
  contact: {
    label: "Contact",
    path: "/contact",
    modules: [],
    sections: {
      postcard: section("Postcard and form", {
        title: text("Heading", contactData.tagline),
        stamp: area("Postage stamp", "Express\nMail"),
        nameLabel: text("Name label", "From: (Name)"),
        namePlaceholder: text("Name placeholder", "Your name"),
        emailLabel: text("Email label", "Return Address: (Email)"),
        emailPlaceholder: text("Email placeholder", "you@example.com"),
        messageLabel: text("Message label", "Message:"),
        messagePlaceholder: text(
          "Message placeholder",
          "Write your note here...",
        ),
        submitLabel: text("Send button", "Drop in Mailbox"),
        successMessage: text(
          "Success message",
          "Postcard sent. We'll get back to you soon.",
        ),
      }),
      delivery: section("Destination and contact", {
        toLabel: text("Destination label", "Deliver To:"),
        to: text("Destination", "The CodeCrafters Desk"),
        room: text("Address line", "Student Tech Club Room"),
        inboxLabel: text("Inbox label", "Digital Inbox:"),
        email: text(
          "Public and form recipient email",
          contactData.email,
          "email",
        ),
        socialLabel: text("Social label", "Connect Details:"),
      }),
    },
  },
  shared: {
    label: "Navigation & footer",
    path: "/",
    modules: [],
    sections: {
      navigation: section("Navigation", {
        logo: image("Logo", logo),
        logoAlt: text("Logo description", "CC Logo"),
        joinLabel: text("Join button", "Join Us"),
        joinLink: link("Join destination", "/contact"),
        links: list(
          "Navigation labels",
          { name: text("Label"), path: link("Destination", "/") },
          navLinks,
        ),
      }),
      footer: section(
        "Footer",
        {
          eyebrow: text("Small heading", "SYS.FOOTER // REGISTRY"),
          brand: text("Wordmark", "CodeCrafters."),
          description: area(
            "Description",
            "Building a culture of code & collaboration. A vibrant club of 1500+ members forging the future of software.",
          ),
          stamp: text("Established label", "[CC-EST-202X]"),
          directoryTitle: text("Directory heading", "Directory"),
          networkTitle: text("Social heading", "Network"),
          members: text("Member count", "1.5K+"),
          copyright: text("Copyright name", "CodeCrafters."),
          tagline: text("Closing tagline", "Engineered with intent."),
        },
        true,
      ),
      social: section("Social links", {
        items: list(
          "Profiles",
          {
            name: text("Name"),
            url: link("Profile URL", "https://"),
            icon: icon("FaLinkedin"),
          },
          socialLinks.map((v, i) => ({
            name: v.name,
            url: v.url,
            icon: ["FaLinkedin", "FaTwitter", "FaInstagram"][i],
          })),
        ),
      }),
    },
  },
};

export function fieldDefaults(fields) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, field]) => [
      key,
      structuredClone(field.default),
    ]),
  );
}
export const defaultPageContent = Object.fromEntries(
  Object.entries(pageSchemas).map(([page, schema]) => [
    page,
    Object.fromEntries(
      Object.entries(schema.sections).map(([key, section]) => [
        key,
        fieldDefaults(section.fields),
      ]),
    ),
  ]),
);

export function normalizePageContent(page, input = {}) {
  const schema = pageSchemas[page];
  if (!schema) throw new Error("Unknown page.");
  return Object.fromEntries(
    Object.entries(schema.sections).map(([key, section]) => [
      key,
      normalizeFields(section.fields, input?.[key]),
    ]),
  );
}
export function validatePageContent(page, input) {
  for (const [key, section] of Object.entries(pageSchemas[page].sections))
    validateFields(section.fields, input?.[key], section.label);
  return normalizePageContent(page, input);
}
