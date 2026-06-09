import { NextResponse } from "next/server";
import { getJobs } from "@/lib/data";

export const dynamic = "force-dynamic";

const categoryRules = [
  { terms: ["software", "developer", "engineer", "frontend", "backend", "full stack", "programmer", "devops", "cloud", "cyber"], category: "Computer and IT" },
  { terms: ["data scientist", "machine learning", "artificial intelligence", " ai ", "analytics", "data analyst"], category: "Data Science" },
  { terms: ["designer", "design", "ux", "ui", "user experience"], category: "Design and UX" },
  { terms: ["product manager", "product owner", "product management"], category: "Product Management" },
  { terms: ["marketing", "seo", "content", "brand", "advertising", "growth"], category: "Advertising and Marketing" },
  { terms: ["sales", "account executive", "business development"], category: "Sales" },
  { terms: ["customer support", "customer service", "customer success"], category: "Customer Service" },
  { terms: ["human resources", "recruiter", "recruiting", "talent", " hr "], category: "Human Resources and Recruitment" },
  { terms: ["finance", "accountant", "accounting", "financial", "payroll"], category: "Accounting and Finance" },
  { terms: ["nurse", "doctor", "medical", "healthcare", "pharmacist", "clinical"], category: "Healthcare" },
  { terms: ["teacher", "education", "professor", "instructor", "trainer"], category: "Education" },
  { terms: ["legal", "lawyer", "attorney", "paralegal"], category: "Legal Services" },
  { terms: ["writer", "editor", "journalist", "communications", "public relations"], category: "Media, PR, and Communications" },
  { terms: ["operations", "business operations", "strategy", "consultant"], category: "Business Operations" },
  { terms: ["project manager", "program manager", "management"], category: "Management" },
  { terms: ["administrative", "office assistant", "receptionist"], category: "Office Administration" },
  { terms: ["manufacturing", "warehouse", "factory", "production"], category: "Manufacturing and Warehouse" },
  { terms: ["hospitality", "hotel", "restaurant", "food service"], category: "Food and Hospitality Services" },
];

function cleanText(value = "") {
  return value
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function detectCategory(role) {
  const normalized = ` ${role.toLowerCase()} `;
  return (
    categoryRules.find((rule) =>
      rule.terms.some((term) => normalized.includes(term)),
    )?.category || ""
  );
}

function extractSalary(description) {
  const matches = description.match(
    /(?:\$|USD\s?)\d[\d,.]*(?:\s*[-–]\s*(?:\$|USD\s?)?\d[\d,.]*)?(?:\s*(?:per|\/)\s*(?:hour|year|yr))?/i,
  );
  return matches?.[0] || "Salary not listed";
}

function normalizeMuseJob(job) {
  const description = cleanText(job.contents);
  const locations = (job.locations || []).map((item) => item.name);
  const isRemote = locations.some((location) =>
    /remote|flexible/i.test(location),
  );

  return {
    id: `muse-${job.id}`,
    title: job.name,
    company: job.company?.name || "Company not listed",
    location: locations.join(" / ") || "Location not listed",
    salary: extractSalary(description),
    type: job.levels?.[0]?.name || "Not specified",
    mode: isRemote ? "Remote / Flexible" : "On-site / Hybrid",
    description,
    requirements: (job.categories || []).map((item) => item.name).join("\n"),
    createdAt: job.publication_date,
    external: true,
    source: "The Muse",
    applyUrl: job.refs?.landing_page,
    tags: [
      ...(job.categories || []).map((item) => item.name),
      ...(job.levels || []).map((item) => item.name),
    ],
  };
}

function searchableText(job) {
  return [
    job.title,
    job.company,
    job.location,
    job.description,
    job.requirements,
    ...(job.tags || []),
  ]
    .join(" ")
    .toLowerCase();
}

function rankJob(job, roleTerms, location) {
  const title = job.title.toLowerCase();
  const haystack = searchableText(job);
  let score = 0;

  roleTerms.forEach((term) => {
    if (title.includes(term)) score += 12;
    else if (haystack.includes(term)) score += 3;
  });

  if (location && job.location.toLowerCase().includes(location.toLowerCase())) {
    score += 10;
  }
  if (!job.external) score += 2;
  return score;
}

async function fetchMusePage({ page, category, location }) {
  const url = new URL("https://www.themuse.com/api/public/jobs");
  url.searchParams.set("page", String(page));
  url.searchParams.set("descending", "true");
  if (category) url.searchParams.set("category", category);
  if (location) url.searchParams.set("location", location);
  if (process.env.THE_MUSE_API_KEY) {
    url.searchParams.set("api_key", process.env.THE_MUSE_API_KEY);
  }

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 600 },
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    throw new Error(
      response.status === 403
        ? "The Muse API rate limit was reached. Add or verify THE_MUSE_API_KEY."
        : `The Muse API returned ${response.status}.`,
    );
  }

  return response.json();
}

export async function GET(request) {
  const role = (request.nextUrl.searchParams.get("q") || "").trim();
  const location = (request.nextUrl.searchParams.get("location") || "").trim();
  const roleTerms = role.toLowerCase().split(/\s+/).filter((term) => term.length > 1);
  const category = detectCategory(role);

  try {
    const localJobsPromise = getJobs();
    const musePagesPromise = Promise.all(
      Array.from({ length: category ? 5 : 10 }, (_, page) =>
        fetchMusePage({ page, category, location }),
      ),
    );
    const [localJobs, musePages] = await Promise.all([
      localJobsPromise,
      musePagesPromise,
    ]);

    const localMatches = localJobs.filter((job) => {
      const haystack = searchableText(job);
      const roleMatch =
        roleTerms.length === 0 ||
        roleTerms.some((term) => haystack.includes(term));
      const locationMatch =
        !location ||
        job.location.toLowerCase().includes(location.toLowerCase()) ||
        (location.toLowerCase() === "remote" &&
          job.mode.toLowerCase() === "remote");
      return roleMatch && locationMatch;
    });

    const museJobs = musePages
      .flatMap((page) => page.results || [])
      .map(normalizeMuseJob);

    // The Muse has category/location filters but no free-text title parameter.
    // Category results are retained and ranked; uncategorized searches require a
    // role term match within the fetched recent pages.
    const relevantMuseJobs = category
      ? museJobs
      : museJobs.filter((job) =>
          roleTerms.length
            ? roleTerms.some((term) => searchableText(job).includes(term))
            : true,
        );

    const seen = new Set();
    const jobs = [
      ...localMatches.map((job) => ({ ...job, source: "JobBoard" })),
      ...relevantMuseJobs,
    ]
      .filter((job) => {
        const key = `${job.title}|${job.company}|${job.location}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort(
        (a, b) =>
          rankJob(b, roleTerms, location) - rankJob(a, roleTerms, location) ||
          new Date(b.createdAt) - new Date(a.createdAt),
      )
      .slice(0, 60);

    return NextResponse.json({
      jobs,
      meta: {
        role,
        location,
        category: category || null,
        sources: ["JobBoard", "The Muse"],
        apiKeyConfigured: Boolean(process.env.THE_MUSE_API_KEY),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "The Muse search is currently unavailable." },
      { status: 502 },
    );
  }
}
