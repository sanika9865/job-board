export const applicationStatuses = [
  "Submitted",
  "Reviewing",
  "Interview",
  "Accepted",
  "Rejected",
];

function requiredString(value, label, maxLength = 5000) {
  const cleanValue = typeof value === "string" ? value.trim() : "";

  if (!cleanValue) return `${label} is required.`;
  if (cleanValue.length > maxLength) {
    return `${label} must be ${maxLength} characters or fewer.`;
  }

  return null;
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateJob(body) {
  const fields = [
    ["title", "Job title", 120],
    ["company", "Company", 120],
    ["location", "Location", 120],
    ["salary", "Salary", 80],
    ["type", "Job type", 40],
    ["mode", "Work mode", 40],
    ["description", "Description", 5000],
    ["requirements", "Requirements", 5000],
    ["contactEmail", "Contact email", 200],
  ];

  for (const [key, label, maxLength] of fields) {
    const error = requiredString(body[key], label, maxLength);
    if (error) return error;
  }

  if (!validEmail(body.contactEmail.trim())) {
    return "Enter a valid contact email.";
  }

  return null;
}

export function validateApplication(body) {
  const fields = [
    ["jobId", "Job", 100],
    ["name", "Full name", 120],
    ["email", "Email", 200],
    ["phone", "Phone", 40],
    ["resumeUrl", "Resume link", 500],
    ["coverLetter", "Cover letter", 5000],
  ];

  for (const [key, label, maxLength] of fields) {
    const error = requiredString(body[key], label, maxLength);
    if (error) return error;
  }

  if (!validEmail(body.email.trim())) return "Enter a valid email address.";

  try {
    const url = new URL(body.resumeUrl.trim());
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
  } catch {
    return "Enter a valid public resume link.";
  }

  return null;
}

export function validateProfile(body) {
  const fields = [
    ["name", "Full name", 120],
    ["email", "Email", 200],
    ["headline", "Professional headline", 160],
    ["location", "Location", 120],
    ["targetRole", "Target role", 120],
    ["experienceLevel", "Experience level", 80],
    ["skills", "Skills", 1000],
    ["bio", "About", 3000],
  ];

  for (const [key, label, maxLength] of fields) {
    const error = requiredString(body[key], label, maxLength);
    if (error) return error;
  }
  if (!validEmail(body.email.trim())) return "Enter a valid email address.";
  return null;
}
