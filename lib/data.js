import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const dataFile = path.join(process.cwd(), "data", "job-board.json");

async function readStore() {
  const contents = await fs.readFile(dataFile, "utf8");
  const store = JSON.parse(contents);
  return {
    jobs: store.jobs || [],
    applications: store.applications || [],
    profiles: store.profiles || [],
    savedJobs: store.savedJobs || [],
  };
}

async function writeStore(store) {
  await fs.writeFile(dataFile, JSON.stringify(store, null, 2), "utf8");
}

export async function getJobs() {
  const store = await readStore();
  return store.jobs.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
}

export async function getJob(id) {
  const store = await readStore();
  return store.jobs.find((job) => job.id === id) || null;
}

export async function createJob(values) {
  const store = await readStore();
  const job = {
    id: randomUUID(),
    ...values,
    createdAt: new Date().toISOString(),
  };

  store.jobs.unshift(job);
  await writeStore(store);
  return job;
}

export async function deleteJob(id) {
  const store = await readStore();
  const exists = store.jobs.some((job) => job.id === id);

  if (!exists) return false;

  store.jobs = store.jobs.filter((job) => job.id !== id);
  store.applications = store.applications.filter(
    (application) => application.jobId !== id,
  );
  await writeStore(store);
  return true;
}

export async function getApplications(email) {
  const store = await readStore();
  const normalizedEmail = email?.trim().toLowerCase();
  const applications = normalizedEmail
    ? store.applications.filter(
        (application) => application.email.toLowerCase() === normalizedEmail,
      )
    : store.applications;

  return applications
    .map((application) => ({
      ...application,
      job:
        store.jobs.find((job) => job.id === application.jobId) ||
        application.externalJob ||
        null,
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function createApplication(values) {
  const store = await readStore();
  const job = store.jobs.find((item) => item.id === values.jobId);

  if (!job) {
    return { error: "This job no longer exists.", status: 404 };
  }

  const duplicate = store.applications.some(
    (application) =>
      application.jobId === values.jobId &&
      application.email.toLowerCase() === values.email.toLowerCase(),
  );

  if (duplicate) {
    return {
      error: "An application for this job already exists for that email.",
      status: 409,
    };
  }

  const application = {
    id: randomUUID(),
    ...values,
    status: "Submitted",
    createdAt: new Date().toISOString(),
  };

  store.applications.unshift(application);
  await writeStore(store);
  return { application, status: 201 };
}

export async function updateApplicationStatus(id, status) {
  const store = await readStore();
  const application = store.applications.find((item) => item.id === id);

  if (!application) return null;

  application.status = status;
  await writeStore(store);
  return application;
}

export async function getProfile(email) {
  const store = await readStore();
  const normalizedEmail = email?.trim().toLowerCase();
  return (
    store.profiles.find(
      (profile) => profile.email.toLowerCase() === normalizedEmail,
    ) || null
  );
}

export async function upsertProfile(values) {
  const store = await readStore();
  const normalizedEmail = values.email.trim().toLowerCase();
  const existing = store.profiles.find(
    (profile) => profile.email.toLowerCase() === normalizedEmail,
  );

  if (existing) {
    Object.assign(existing, values, {
      email: normalizedEmail,
      updatedAt: new Date().toISOString(),
    });
    await writeStore(store);
    return existing;
  }

  const profile = {
    id: randomUUID(),
    ...values,
    email: normalizedEmail,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.profiles.push(profile);
  await writeStore(store);
  return profile;
}

export async function getSavedJobs(email) {
  const store = await readStore();
  const normalizedEmail = email?.trim().toLowerCase();
  return store.savedJobs
    .filter((saved) => saved.email.toLowerCase() === normalizedEmail)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function saveJob(email, job) {
  const store = await readStore();
  const normalizedEmail = email.trim().toLowerCase();
  const existing = store.savedJobs.find(
    (saved) =>
      saved.email.toLowerCase() === normalizedEmail &&
      saved.job.id === job.id,
  );
  if (existing) return existing;

  const savedJob = {
    id: randomUUID(),
    email: normalizedEmail,
    job,
    createdAt: new Date().toISOString(),
  };
  store.savedJobs.unshift(savedJob);
  await writeStore(store);
  return savedJob;
}

export async function removeSavedJob(email, jobId) {
  const store = await readStore();
  const normalizedEmail = email.trim().toLowerCase();
  const before = store.savedJobs.length;
  store.savedJobs = store.savedJobs.filter(
    (saved) =>
      !(
        saved.email.toLowerCase() === normalizedEmail &&
        saved.job.id === jobId
      ),
  );
  if (store.savedJobs.length === before) return false;
  await writeStore(store);
  return true;
}

export async function trackExternalApplication(values) {
  const store = await readStore();
  const normalizedEmail = values.email.trim().toLowerCase();
  const existing = store.applications.find(
    (application) =>
      application.email.toLowerCase() === normalizedEmail &&
      application.jobId === values.job.id,
  );
  if (existing) return existing;

  const application = {
    id: randomUUID(),
    jobId: values.job.id,
    name: values.name,
    email: normalizedEmail,
    phone: values.phone || "",
    resumeUrl: values.resumeUrl || "",
    coverLetter: values.coverLetter || "",
    status: "External application",
    external: true,
    externalJob: values.job,
    createdAt: new Date().toISOString(),
  };
  store.applications.unshift(application);
  await writeStore(store);
  return application;
}

export async function deleteCandidateData(email) {
  const store = await readStore();
  const normalizedEmail = email.trim().toLowerCase();
  store.profiles = store.profiles.filter(
    (profile) => profile.email.toLowerCase() !== normalizedEmail,
  );
  store.savedJobs = store.savedJobs.filter(
    (saved) => saved.email.toLowerCase() !== normalizedEmail,
  );
  store.applications = store.applications.filter(
    (application) => application.email.toLowerCase() !== normalizedEmail,
  );
  await writeStore(store);
}
