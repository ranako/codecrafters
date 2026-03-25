import {
  FaCode,
  FaBrain,
  FaShieldAlt,
  FaRocket,
  FaLink,
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaLightbulb,
  FaHandshake,
  FaGlobe,
} from "react-icons/fa";

export const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Events", path: "/events" },
  { name: "Team", path: "/team" },
  { name: "Contact", path: "/contact" },
];

export const heroData = {
  badge: "Student Tech Community",
  title: "BUILDING A CULTURE OF",
  titleHighlight: "CODE & COLLABORATION",
  subtitle:
    "Join our vibrant student tech club. We organize workshops, hackathons, and collaborate on cutting-edge projects together.",
  cta: "Explore More",
  ctaSecondary: "Join Us",
};

export const domains = [
  { name: "Full Stack Dev", icon: FaCode, color: "#3b82f6" },
  { name: "AI / ML", icon: FaBrain, color: "#8b5cf6" },
  { name: "Cybersecurity", icon: FaShieldAlt, color: "#06b6d4" },
  { name: "Entrepreneurship", icon: FaRocket, color: "#f59e0b" },
  { name: "Blockchain / Web3", icon: FaLink, color: "#10b981" },
];

export const aboutData = {
  tagline: "Who We Are",
  title: "Empowering the Next Generation of Tech Leaders",
  description:
    "CodeCrafters is a student-led tech community started with a mission to bridge the gap between academic learning and real-world skills through collaboration, mentorship, and hands-on experience.",
  longDescription:
    "From cutting-edge projects to meaningful connections, we inspire breakthroughs and shape tomorrow's tech leaders — one epic journey at a time. Join us in building the future through code, creativity, and collaboration.",
  communitySize: "1500+",
  communitySizeLabel: "Community Members",
  values: [
    {
      title: "Innovation",
      description:
        "Driven by cutting-edge technology and forward-thinking solutions that push the boundaries of what's possible.",
      icon: FaLightbulb,
    },
    {
      title: "Collaboration",
      description:
        "United by our passion for building meaningful connections and working together on impactful projects.",
      icon: FaHandshake,
    },
    {
      title: "Community",
      description:
        "Bringing together brilliant minds to shape the future, fostering an inclusive environment for all skill levels.",
      icon: FaGlobe,
    },
  ],
  mission:
    "To bridge the gap between academic learning and industry-ready skills by creating an ecosystem of collaboration, mentorship, and innovation.",
  vision:
    "To be the leading student tech community that nurtures future tech leaders, fostering a culture where every student can learn, grow, and make an impact.",
  whyJoin: [
    "Hands-on workshops and bootcamps across cutting-edge tech domains",
    "Mentorship from industry professionals and experienced peers",
    "Real-world project experience and portfolio building",
    "Networking opportunities with tech leaders and startups",
    "A vibrant, inclusive community of 1500+ passionate members",
  ],
};
export const ogTeamMembers = [
  {
    name: "Maadhav Sharma",
    role: "Founder",
    linkedin: "https://linkedin.com/in/maadhav-sharma",
    image:
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Vatsal Bhartia",
    role: "Co-Founder",
    linkedin: "https://www.linkedin.com/in/vatsal-bhatiya",
    image:
      "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Kunal Jain",
    role: "Core Member",
    linkedin: "https://www.linkedin.com/in/kunal976",
    image:
      "https://images.unsplash.com/photo-1583864697784-a0efc8379f70?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Pinkesh",
    role: "Core Member",
    linkedin: "https://www.linkedin.com/in/pinkesh-tripathi-ab52041b0",
    image:
      "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Anshul Bhartiya",
    role: "Core Member",
    linkedin: "https://www.linkedin.com/in/anshulbhartiya",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600",
  },
  {
    name: "Abdulhaadi Lakhani",
    role: "Core Member",
    linkedin: "https://linkedin.com/in/abdulhaadi-lakhani",
    image:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=600",
  },
];

export const socialLinks = [
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/company/codecraftersofficial",
    icon: FaLinkedin,
  },
  {
    name: "Twitter",
    url: "https://x.com/CodeCraftersGLS",
    icon: FaTwitter,
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/codecrafters.community",
    icon: FaInstagram,
  },
];

export const contactData = {
  email: "hello@codecrafters.com",
  tagline: "Let's Build Something Amazing Together",
  description:
    "Have a question, idea, or just want to connect? Reach out to us and we'll get back to you as soon as possible.",
};

export const projectsData = [
  {
    id: 1,
    title: "EcoTrack App",
    description: "A comprehensive sustainability tracking dashboard built with React and Tailwind CSS.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    tags: ["React", "Express", "MongoDB"]
  },
  {
    id: 2,
    title: "FinServe Platform",
    description: "Next-generation fintech landing page with advanced Framer Motion animations.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    tags: ["Next.js", "Framer", "Tailwind"]
  },
  {
    id: 3,
    title: "AI Chat Assistant",
    description: "An AI-powered developer assistant interface built using modern web standards.",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=800",
    tags: ["OpenAI", "React", "Node.js"]
  }
];
