// Initial site content, seeded on first start so the admin dashboard opens pre-filled.
// Every key here is editable from the dashboard; the public site falls back to its static HTML when the API is offline.

export const DEFAULT_CONTENT: Record<string, Record<string, unknown> | Record<string, unknown>[]> = {
  site: {
    title: "Mark Otwane | Full-Stack Web Developer",
    description: "Mark Otwane is a full-stack web developer creating useful, beautiful digital products.",
    footerText: "Developed by",
    footerLinkText: "Microtech Solutions Limited",
    footerLinkUrl: "https://microtech-solutions.vercel.app/"
  },
  hero: {
    eyebrow: "Welcome to my portfolio",
    greeting: "Hi, I'm",
    name: "Mark Otwane.",
    role: "A Full-Stack Web Developer.",
    description:
      "I'm a Full-Stack Web Developer. I specialize in both Front-End and Back-End Development, creating seamless, user-friendly websites and applications. I love to create beautiful and functional websites.",
    image: "MarkB.png",
    cvUrl: "MARK OTWANE RESUME.pdf",
    cvLabel: "View CV",
    contactLabel: "Contact me"
  },
  about: {
    titleLead: "About",
    titleAccent: "me",
    infoTitle: "Information About me",
    text:
      "I have dedicated my career to blending artistic vision with technical proficiency. With years of experience in web development, I craft responsive, user-friendly websites that make a lasting impression. My graphic design skills bring brands to life through compelling visuals, while my video editing expertise transforms raw footage into engaging stories.",
    skillsTitle: "My Skills",
    timelineTitle: "My Timeline",
    stats: [
      { value: "30+", label: "Projects Completed" },
      { value: "2+", label: "Years of Experience" },
      { value: "10+", label: "Happy Clients" },
      { value: "5+", label: "Customer Review" }
    ]
  },
  skills: [
    { id: "html5", name: "HTML5", level: 90 },
    { id: "css", name: "CSS", level: 70 },
    { id: "javascript", name: "JavaScript", level: 50 },
    { id: "java", name: "Java", level: 80 },
    { id: "php", name: "PHP", level: 40 },
    { id: "mysql", name: "MySQL", level: 40 }
  ],
  experience: [
    { id: "software-engineer", period: "2023 to present", role: "Software Engineer", company: "Microtech Solutions Limited", description: "Building innovative solutions with code. Let's create something amazing for the future." },
    { id: "graphic-designer", period: "2022 to present", role: "Graphic Designer", company: "Microtech Solutions Limited", description: "Crafting visual stories that captivate and inspire. Allow me to bring your ideas to life!" },
    { id: "life-coach", period: "2024 to present", role: "Life Couch", company: "Microtech Solutions Limited", description: "Empowering you to unlock your potential and live your best life. Come we grow together." },
    { id: "author", period: "2025 to present", role: "Author", company: "Microtech Solutions Limited", description: "Helping you transform your life one book at a time. Let's embark on the journey of self-growth." }
  ],
  portfolio: {
    titleLead: "My",
    titleAccent: "Portfolio",
    intro: "Here are some of my work that I've done in various programming languages."
  },
  blog: {
    titleLead: "My",
    titleAccent: "Blogs",
    emptyText: "Articles are coming soon."
  },
  blogs: [],
  contact: {
    titleLead: "Contact",
    titleAccent: "Me",
    heading: "Contact me here",
    text: "Feel free to reach out I'm always happy to here from you.",
    location: "Nairobi, Kenya.",
    email: "otwanemark005@gmail.com",
    phone: "+254114735711",
    languages: "English, Swahili, Teso.",
    socials: [
      { platform: "facebook", url: "https://www.facebook.com/otwanemark" },
      { platform: "twitter", url: "https://x.com/MarkOtwane" },
      { platform: "instagram", url: "https://www.instagram.com/otwanemark/" },
      { platform: "linkedin", url: "https://www.linkedin.com" },
      { platform: "github", url: "https://github.com/MarkOtwane/" }
    ]
  }
};

export const DEFAULT_PROJECTS = [
  { title: "Hospital Management system", image: "hospital management.jpg" },
  { title: "Library Management", image: "library management.jpg" },
  { title: "Housing Management System", image: "rental management.jpg" },
  { title: "Tour Management System", image: "Tour.jpg" },
  { title: "Student Portal", image: "student management.jpg" },
  { title: "Transaction tracker", image: "Transaction tracker.jpg" }
].map((project, index) => ({ ...project, sortOrder: index }));
