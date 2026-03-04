import {
  Search,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Shield,
  Clock,
  Award,
  Briefcase,
  Building2,
  LayoutDashboard,
  Plus,
  CalendarDays,
  Bookmark,
  User,
} from "lucide-react";

export const jobSeekerFeatures = [
  {
    icon: Search,
    title: "Smart Job Matching",
    description: "AI-powered recommendations tailored to your skills and preferences.",
  },
  {
    icon: FileText,
    title: "Easy Resume Builder",
    description: "Create professional resumes in minutes with our intuitive editor.",
  },
  {
    icon: MessageSquare,
    title: "Instant Interview Prep",
    description: "Practice with AI interviewers and get instant feedback on your responses.",
  },
  {
    icon: Award,
    title: "Skill Endorsements",
    description: "Get endorsements from peers and employers to showcase your skills.",
  },
];

export const employerFeatures = [
  {
    icon: Users,
    title: "Find Top Talent",
    description: "Access a vast pool of qualified candidates with advanced filtering.",
  },
  {
    icon: Shield,
    title: "Verified Candidates",
    description: "Ensure authenticity with our verification system.",
  },
  {
    icon: Clock,
    title: "Streamlined Hiring",
    description: "Manage your hiring pipeline efficiently from posting to offer.",
  },
  {
    icon: Award,
    title: "Build Your Brand",
    description: "Showcase your company culture and attract the best talent.",
  },
];

export const EMPLOYER_MENU = [
  { id: "employer-dashboard", name: "Dashboard", icon: LayoutDashboard },
  { id: "manage-jobs", name: "Manage Jobs", icon: Briefcase },
  { id: "post-job", name: "Post Jobs", icon: Plus },
  { id: "company-profile", name: "Company Profile", icon: Building2 },
  { id: "events", name: "Events", icon: CalendarDays },
]

export const JOB_SEEKER_MENU = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
  { id: "search", name: "Find Jobs", icon: Search },
  { id: "saved-jobs", name: "Saved Jobs", icon: Bookmark },
  { id: "profile", name: "Profile", icon: User },
  { id: "events", name: "Events", icon: CalendarDays },
]

export const CATEGORIES = [
  { value: "Software / Tech", label: "Software / Tech" },
  { value: "Electronics (ECE)", label: "Electronics (ECE)" },
  { value: "Mechanical (MECH)", label: "Mechanical (MECH)" },
  { value: "Civil", label: "Civil" },
  { value: "Management", label: "Management" },
  { value: "Design", label: "Design" },
  { value: "Marketing", label: "Marketing" },
  { value: "Data Science", label: "Data Science" },
  { value: "Finance", label: "Finance" },
  { value: "Product Management", label: "Product Management" },
  { value: "Legal", label: "Legal" },
  { value: "Operations", label: "Operations" },
  { value: "Research", label: "Research" },
  { value: "Sales", label: "Sales" },
  { value: "Other", label: "Other" },
]
export const JOB_TYPES = [
  { value: "Full-time", label: "Full-time" },
  { value: "Part-time", label: "Part-time" },
  { value: "Contract", label: "Contract" },
  { value: "Temporary", label: "Temporary" },
  { value: "Internship", label: "Internship" },
  { value: "Other", label: "Other" },
]
export const SALARY_RANGE = [
  { value: "0-50000", label: "$0 - $50,000" },
  { value: "50000-100000", label: "$50,000 - $100,000" },
  { value: "100000-150000", label: "$100,000 - $150,000" },
  { value: "150000-200000", label: "$150,000 - $200,000" },
  { value: "200000+", label: "$200,000+" },
]