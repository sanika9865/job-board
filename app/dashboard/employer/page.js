"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const statuses = ["Submitted", "Reviewing", "Interview", "Accepted", "Rejected"];

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const [jobsResponse, applicationsResponse] = await Promise.all([
        fetch("/api/jobs", { cache: "no-store" }),
        fetch("/api/applications", { cache: "no-store" }),
      ]);
      const jobsData = await jobsResponse.json();
      const applicationsData = await applicationsResponse.json();
      if (!jobsResponse.ok || !applicationsResponse.ok) {
        throw new Error("Could not load the employer dashboard.");
      }
      setJobs(jobsData.jobs);
      setApplications(
        applicationsData.applications.filter(
          (application) => !application.external,
        ),
      );
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function removeJob(job) {
    const confirmed = window.confirm(
      `Delete "${job.title}" and all of its applications?`,
    );
    if (!confirmed) return;

    const response = await fetch(`/api/jobs/${job.id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Could not delete this job.");
      return;
    }
    await loadDashboard();
  }

  async function changeStatus(applicationId, status) {
    const response = await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      setError("Could not update the application status.");
      return;
    }

    setApplications((current) =>
      current.map((application) =>
        application.id === applicationId
          ? { ...application, status }
          : application,
      ),
    );
  }

  return (
    <main>
      <Header />
      <section className="page-hero dashboard-hero">
        <div>
          <span className="section-kicker">Employer dashboard</span>
          <h1>Manage jobs and applicants</h1>
          <p>Review your listings and move candidates through the hiring process.</p>
        </div>
        <Link className="primary-button" href="/post-job">Post a new job</Link>
      </section>

      <section className="dashboard-shell">
        {loading && <div className="loading-state">Loading dashboard...</div>}
        {error && <div className="message error-message">{error}</div>}
        {!loading && (
          <>
            <div className="stat-grid">
              <div><strong>{jobs.length}</strong><span>Active jobs</span></div>
              <div><strong>{applications.length}</strong><span>Total applications</span></div>
              <div>
                <strong>{applications.filter((item) => item.status === "Interview").length}</strong>
                <span>Interviews</span>
              </div>
            </div>

            <div className="dashboard-section">
              <div className="dashboard-title">
                <h2>Active listings</h2>
                <span>{jobs.length} total</span>
              </div>
              <div className="management-list">
                {jobs.map((job) => {
                  const count = applications.filter((item) => item.jobId === job.id).length;
                  return (
                    <article className="management-row" key={job.id}>
                      <div>
                        <h3>{job.title}</h3>
                        <p>{job.company} · {job.location} · {count} applicants</p>
                      </div>
                      <div className="row-actions">
                        <Link href={`/jobs/${job.id}`}>View</Link>
                        <button className="danger-button" onClick={() => removeJob(job)}>Delete</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="dashboard-section">
              <div className="dashboard-title">
                <h2>Recent applicants</h2>
                <span>{applications.length} total</span>
              </div>
              {applications.length === 0 ? (
                <div className="empty-state compact-empty">
                  <h3>No applications yet</h3>
                  <p>New candidate submissions will appear here.</p>
                </div>
              ) : (
                <div className="applicant-list">
                  {applications.map((application) => (
                    <article className="applicant-card" key={application.id}>
                      <div className="applicant-heading">
                        <div>
                          <h3>{application.name}</h3>
                          <p>{application.job?.title || "Removed job"} · {application.email}</p>
                        </div>
                        <select
                          value={application.status}
                          onChange={(event) => changeStatus(application.id, event.target.value)}
                          aria-label={`Application status for ${application.name}`}
                        >
                          {statuses.map((status) => <option key={status}>{status}</option>)}
                        </select>
                      </div>
                      <p className="cover-letter">{application.coverLetter}</p>
                      <div className="applicant-links">
                        <a href={`mailto:${application.email}`}>Email candidate</a>
                        <a href={application.resumeUrl} target="_blank" rel="noreferrer">Open resume</a>
                        <a href={`tel:${application.phone}`}>{application.phone}</a>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>
      <Footer />
    </main>
  );
}
