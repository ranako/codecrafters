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
import maadhavImage from "../images/maadhav.jpg";
import vatsalImage from "../images/vatsal.jpg";
import kunalImage from "../images/kunal.jpg";
import pinkeshImage from "../images/pinkesh.jpg";
import anshulImage from "../images/anshul.jpg";
import abdulImage from "../images/abdul.jpg";

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
    image: maadhavImage,
  },
  {
    name: "Vatsal Bhartia",
    role: "Co-Founder",
    linkedin: "https://www.linkedin.com/in/vatsal-bhatiya",
    image: vatsalImage,
  },
  {
    name: "Kunal Jain",
    role: "Core Member",
    linkedin: "https://www.linkedin.com/in/kunal976",
    image: kunalImage,
  },
  {
    name: "Pinkesh",
    role: "Core Member",
    linkedin: "https://www.linkedin.com/in/pinkesh-tripathi-ab52041b0",
    image: pinkeshImage,
  },
  {
    name: "Anshul Bhartiya",
    role: "Core Member",
    linkedin: "https://www.linkedin.com/in/anshulbhartiya",
    image: anshulImage,
  },
  {
    name: "Abdulhaadi Lakhani",
    role: "Core Member",
    linkedin: "https://linkedin.com/in/abdulhaadi-lakhani",
    image: abdulImage,
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
  email: "codecraftersofficial.com",
  tagline: "Let's Build Something Amazing Together",
  description:
    "Have a question, idea, or just want to connect? Reach out to us and we'll get back to you as soon as possible.",
};

