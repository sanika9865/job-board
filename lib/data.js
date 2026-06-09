import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const dataFile = path.join(process.cwd(), "data", "job-board.json");

async function readStore() {
  const contents = await fs.readFile(dataFile, "utf8");
  return JSON.parse(contents);
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
      job: store.jobs.find((job) => job.id === application.jobId) || null,
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
