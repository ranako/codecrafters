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

export const upcomingEventsData = [
  {
    id: 1,
    title: "Global Hackathon 2026",
    description: "A 48-hour worldwide coding sprint to build innovative AI tools. Sponsored by global tech leaders, featuring massive prizes.",
    category: "Hackathon",
    date: "Dec 15, 2026",
    gradient: "from-blue-500 to-cyan-500",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800",
    location: "Main Auditorium, Campus",
    time: "10:00 AM (48 Hrs)",
    speakers: ["Alex Chen (AI Researcher)"]
  },
  {
    id: 2,
    title: "Web Accessibility Workshop",
    description: "Learn how to build inclusive web experiences. A hands-on session focusing on ARIA, semantic HTML, and accessibility tools.",
    category: "Development",
    date: "Nov 5, 2026",
    gradient: "from-purple-500 to-pink-500",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800",
    location: "Design Lab 3",
    time: "2:00 PM - 5:00 PM",
    speakers: ["Sarah Williams (UX Designer)"]
  }
];

export const teamData = {
  og: [
    {
      name: "Maadhav Sharma",
      role: "Founder",
      linkedin: "https://linkedin.com/in/maadhav-sharma",
      image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Vatsal Bhartia",
      role: "Co-Founder",
      linkedin: "https://www.linkedin.com/in/vatsal-bhatiya",
      image: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Kunal Jain",
      role: "Core Member",
      linkedin: "https://www.linkedin.com/in/kunal976",
      image: "https://images.unsplash.com/photo-1583864697784-a0efc8379f70?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Pinkesh",
      role: "Core Member",
      linkedin: "https://www.linkedin.com/in/pinkesh-tripathi-ab52041b0",
      image: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Anshul Bhartiya",
      role: "Core Member",
      linkedin: "https://www.linkedin.com/in/anshulbhartiya",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Abdulhaadi Lakhani",
      role: "Core Member",
      linkedin: "https://linkedin.com/in/abdulhaadi-lakhani",
      image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=600"
    },
  ],
  core: [
    {
      name: "Param Munjani",
      role: "Management Lead",
      linkedin: "https://www.linkedin.com/in/parammunjani07",
      image: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Tanisha Chopra",
      role: "Social Media Lead",
      linkedin: "https://www.linkedin.com/in/tanisha-chopra-352b28279",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Rana Shivam Raj",
      role: "BTech Lead",
      linkedin: "https://www.linkedin.com/in/rana-shivam-raj-84156231a",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Vraj Shah",
      role: "Core Member",
      linkedin: "",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600"
    },
  ],
};

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

export const testimonialsData = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Frontend Developer",
    text: "CodeCrafters gave me the real-world experience I needed to land my first developer role. Highly recommended!",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: 2,
    name: "Sarah Williams",
    role: "UX Designer",
    text: "The collaborative environment here is unmatched. It's the perfect place to grow your skills and network.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: 3,
    name: "David Chen",
    role: "Software Engineer",
    text: "From hackathons to workshops, the events organized by this community are top-tier and incredibly educational.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: 4,
    name: "Emily Davis",
    role: "Product Manager",
    text: "I learned more in one month of building projects here than I did in a whole year of standard classes.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
  }
];

export const pastEventsData = [
  {
    id: 1,
    title: "Cyber Security Workshop",
    date: "2024",
    description: "An intensive workshop exploring the fundamentals of cybersecurity, ethical hacking, and modern defense strategies against digital threats.",
    coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    photos: ["https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=600", "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&q=80&w=600"]
  },
  {
    id: 2,
    title: "Figma to Functional",
    date: "2024",
    description: "A hands-on coding workshop with industry experts, transforming Figma designs into fully functional web applications using modern frameworks.",
    coverImage: "https://images.unsplash.com/photo-1618477388954-7852f32655cc?auto=format&fit=crop&q=80&w=800",
    photos: ["https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=600", "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=600"]
  },
  {
    id: 3,
    title: "Tech Talk",
    date: "2024",
    description: "An engaging learning and networking session bringing together developers, designers, and tech enthusiasts to share insights and experiences.",
    coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800",
    photos: ["https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=600", "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=600"]
  },
  {
    id: 4,
    title: "Data Science Workshop",
    date: "2024",
    description: "A deep dive into data science fundamentals, machine learning algorithms, and practical applications of AI in solving real-world problems.",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    photos: ["https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=600", "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600"]
  },
  {
    id: 5,
    title: "Annual Hackathon 2024",
    date: "February 2024",
    description: "Our flagship 24-hour hackathon where students built incredible projects ranging from AI chatbots to sustainability apps. Over 300 students participated, forming 60+ teams.",
    coverImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800",
    photos: [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: 6,
    title: "Web3 & Blockchain Summit",
    date: "November 2023",
    description: "An interactive summit introducing students to smart contracts and decentralized apps. Featuring guest speakers from leading web3 startups and hands-on coding sessions.",
    coverImage: "https://images.unsplash.com/photo-1639762681485-074b7f4ec651?auto=format&fit=crop&q=80&w=800",
    photos: [
      "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1591696205602-2f950c417cb9?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: 7,
    title: "Intro to React & Tailwind",
    date: "September 2023",
    description: "A beginner-friendly bootcamp designed to get new club members up to speed with modern frontend development. Students built their own portfolio sites by the end of the day.",
    coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800",
    photos: [
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600"
    ]
  }
];
