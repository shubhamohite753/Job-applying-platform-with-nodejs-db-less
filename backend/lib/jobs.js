import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const JOBS_FILE = path.join(DATA_DIR, "jobs.json");

const SEED_JOBS = [
  { title: "React Developer", company: "Infosys", location: "Pune", experience: "1-3 years", workMode: "Hybrid", salary: "₹6–10 LPA", skills: "React, JavaScript, REST API" },
  { title: "Node.js Backend Engineer", company: "TCS", location: "Bangalore", experience: "3-5 years", workMode: "Onsite", salary: "₹12–18 LPA", skills: "Node.js, Express, MongoDB" },
  { title: "Full Stack Developer", company: "Wipro", location: "Hyderabad", experience: "3-5 years", workMode: "Remote", salary: "₹10–15 LPA", skills: "React, Node.js, PostgreSQL" },
  { title: "Frontend Engineer", company: "Accenture", location: "Mumbai", experience: "1-3 years", workMode: "Hybrid", salary: "₹7–11 LPA", skills: "React, TypeScript, Tailwind" },
  { title: "Software Engineer", company: "Capgemini", location: "Chennai", experience: "Fresher", workMode: "Onsite", salary: "₹3.5–5 LPA", skills: "Java, SQL, OOP" },
  { title: "Senior React Developer", company: "Persistent", location: "Pune", experience: "5-8 years", workMode: "Hybrid", salary: "₹18–24 LPA", skills: "React, Redux, System design" },
  { title: "DevOps Engineer", company: "HCL", location: "Noida", experience: "3-5 years", workMode: "Onsite", salary: "₹11–16 LPA", skills: "AWS, Docker, Kubernetes" },
  { title: "Python Developer", company: "Cognizant", location: "Kolkata", experience: "1-3 years", workMode: "Remote", salary: "₹6–9 LPA", skills: "Python, Django, REST" },
  { title: "Java Developer", company: "IBM", location: "Bangalore", experience: "3-5 years", workMode: "Hybrid", salary: "₹13–17 LPA", skills: "Java, Spring Boot, Microservices" },
  { title: "UI/UX Developer", company: "Zoho", location: "Chennai", experience: "1-3 years", workMode: "Onsite", salary: "₹5–8 LPA", skills: "Figma, HTML, CSS, React" },
  { title: "Next.js Developer", company: "Freshworks", location: "Chennai", experience: "1-3 years", workMode: "Hybrid", salary: "₹8–12 LPA", skills: "Next.js, React, TypeScript" },
  { title: "Lead Engineer", company: "Flipkart", location: "Bangalore", experience: "8+ years", workMode: "Hybrid", salary: "₹35–50 LPA", skills: "Architecture, React, Node.js" },
  { title: "QA Automation Engineer", company: "Mindtree", location: "Pune", experience: "3-5 years", workMode: "Remote", salary: "₹9–13 LPA", skills: "Selenium, Cypress, API testing" },
  { title: "Data Engineer", company: "Amazon", location: "Hyderabad", experience: "3-5 years", workMode: "Onsite", salary: "₹20–28 LPA", skills: "Python, Spark, SQL" },
  { title: "Android Developer", company: "Paytm", location: "Noida", experience: "1-3 years", workMode: "Hybrid", salary: "₹10–14 LPA", skills: "Kotlin, Android SDK" },
  { title: "Cloud Architect", company: "Microsoft", location: "Hyderabad", experience: "8+ years", workMode: "Hybrid", salary: "₹40–55 LPA", skills: "Azure, AWS, Terraform" },
  { title: "MERN Stack Developer", company: "Razorpay", location: "Bangalore", experience: "3-5 years", workMode: "Remote", salary: "₹15–22 LPA", skills: "MongoDB, Express, React, Node" },
  { title: "Intern — Software Development", company: "StartUp Labs", location: "Pune", experience: "Fresher", workMode: "Onsite", salary: "₹15k–25k / month", skills: "JavaScript, Git, willingness to learn" },
  { title: "Technical Lead", company: "Oracle", location: "Bangalore", experience: "8+ years", workMode: "Onsite", salary: "₹30–42 LPA", skills: "Java, Leadership, Cloud" },
  { title: "React Native Developer", company: "Swiggy", location: "Bangalore", experience: "3-5 years", workMode: "Hybrid", salary: "₹14–20 LPA", skills: "React Native, iOS, Android" },
  { title: "Backend Developer (Go)", company: "Uber", location: "Hyderabad", experience: "5-8 years", workMode: "Hybrid", salary: "₹25–35 LPA", skills: "Go, Distributed systems" },
  { title: "Associate Consultant", company: "Deloitte", location: "Mumbai", experience: "1-3 years", workMode: "Onsite", salary: "₹8–10 LPA", skills: "Consulting, SQL, Excel" },
  { title: "Product Engineer", company: "Atlassian", location: "Remote", experience: "3-5 years", workMode: "Remote", salary: "₹22–30 LPA", skills: "React, Node, Product thinking" },
  { title: "Site Reliability Engineer", company: "Google", location: "Bangalore", experience: "5-8 years", workMode: "Hybrid", salary: "₹28–40 LPA", skills: "Linux, Kubernetes, Monitoring" },
  { title: "Angular Developer", company: "LTIMindtree", location: "Mumbai", experience: "1-3 years", workMode: "Onsite", salary: "₹6–9 LPA", skills: "Angular, TypeScript, RxJS" },
  { title: "Blockchain Developer", company: "Tech Mahindra", location: "Pune", experience: "3-5 years", workMode: "Remote", salary: "₹12–18 LPA", skills: "Solidity, Web3, Node.js" },
  { title: "SAP Consultant", company: "SAP Labs", location: "Bangalore", experience: "5-8 years", workMode: "Hybrid", salary: "₹16–22 LPA", skills: "SAP FICO, Implementation" },
  { title: "Cybersecurity Analyst", company: "Quick Heal", location: "Pune", experience: "1-3 years", workMode: "Onsite", salary: "₹5–7 LPA", skills: "Security, Networking, SIEM" },
  { title: "Machine Learning Engineer", company: "NVIDIA", location: "Pune", experience: "3-5 years", workMode: "Hybrid", salary: "₹18–26 LPA", skills: "Python, PyTorch, ML pipelines" },
  { title: "Business Analyst", company: "Genpact", location: "Gurgaon", experience: "1-3 years", workMode: "Hybrid", salary: "₹6–8 LPA", skills: "SQL, Power BI, Requirements" },
  { title: "Scrum Master", company: "Infosys", location: "Bangalore", experience: "5-8 years", workMode: "Remote", salary: "₹14–19 LPA", skills: "Agile, Jira, Stakeholder management" },
];

function ensureJobsFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(JOBS_FILE)) {
    const now = Date.now();
    const jobs = SEED_JOBS.map((j, i) => ({
      id: `job-${i + 1}`,
      ...j,
      postedAt: new Date(now - i * 86400000).toISOString(),
    }));
    fs.writeFileSync(JOBS_FILE, JSON.stringify({ jobs }, null, 2), "utf8");
  }
}

export function loadJobs() {
  ensureJobsFile();
  const raw = fs.readFileSync(JOBS_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.jobs) ? parsed.jobs : [];
  } catch {
    return [];
  }
}

export function findJobById(id) {
  return loadJobs().find((j) => j.id === id) ?? null;
}

export function getFilterOptions(jobs) {
  const locations = [...new Set(jobs.map((j) => j.location))].sort();
  const experienceLevels = [...new Set(jobs.map((j) => j.experience))].sort();
  const workModes = [...new Set(jobs.map((j) => j.workMode))].sort();
  return { locations, experienceLevels, workModes };
}

export function listJobs(query = {}) {
  const {
    search = "",
    location = "",
    experience = "",
    workMode = "",
    page = "1",
    limit = "10",
  } = query;

  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 10));
  const q = String(search).trim().toLowerCase();

  let jobs = loadJobs();

  if (q) {
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.skills.toLowerCase().includes(q)
    );
  }
  if (location) jobs = jobs.filter((j) => j.location === location);
  if (experience) jobs = jobs.filter((j) => j.experience === experience);
  if (workMode) jobs = jobs.filter((j) => j.workMode === workMode);

  jobs = [...jobs].sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
  );

  const total = jobs.length;
  const totalPages = Math.max(1, Math.ceil(total / limitNum));
  const safePage = Math.min(pageNum, totalPages);
  const start = (safePage - 1) * limitNum;
  const slice = jobs.slice(start, start + limitNum);

  const allJobs = loadJobs();
  return {
    jobs: slice,
    pagination: {
      page: safePage,
      limit: limitNum,
      total,
      totalPages,
    },
    filters: getFilterOptions(allJobs),
  };
}
