"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ArrowIcon, LocationIcon } from "@/components/Icons";

const initialApplication = {
  name: "",
  email: "",
  phone: "",
  resumeUrl: "",
  coverLetter: "",
};

export default function JobDetailsPage({ params, searchParams }) {
  const { id } = use(params);
  const query = use(searchParams);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState(initialApplication);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadJob() {
      try {
        const response = await fetch(`/api/jobs/${id}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load this job.");
        setJob(data.job);
      } catch (error) {
        setLoadError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [id]);

  useEffect(() => {
    try {
      const profile = JSON.parse(
        localStorage.getItem("jobboard-profile") || "null",
      );
      if (profile) {
        setForm((current) => ({
          ...current,
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          resumeUrl: profile.resumeUrl
            ? `${window.location.origin}${profile.resumeUrl}`
            : "",
        }));
      }
    } catch {}
  }, []);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function submitApplication(event) {
    event.preventDefault();
    setFormError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, jobId: id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not submit application.");
      setSubmittedEmail(form.email);
      setSuccess("Application submitted successfully. You can now track it by email.");
      setForm(initialApplication);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <Header />
      {loading && <div className="page-status">Loading job details...</div>}
      {loadError && (
        <div className="page-status">
          <div className="message error-message">{loadError}</div>
          <Link className="secondary-button" href="/">Back to jobs</Link>
        </div>
      )}
      {job && (
        <>
          <section className="detail-hero">
            <div>
              {query.posted === "1" && (
                <div className="message success-message">
                  Your job is live and ready for applicants.
                </div>
              )}
              <span className="section-kicker">{job.company}</span>
              <h1>{job.title}</h1>
              <div className="detail-meta">
                <span><LocationIcon />{job.location}</span>
                <span>{job.salary}</span>
                <span>{job.type}</span>
                <span>{job.mode}</span>
              </div>
            </div>
            <a className="primary-button" href="#apply">
              Apply now <ArrowIcon />
            </a>
          </section>

          <section className="detail-layout">
            <article className="detail-content">
              <section>
                <span className="section-kicker">About the role</span>
                <h2>Job description</h2>
                <p>{job.description}</p>
              </section>
              <section>
                <span className="section-kicker">What you bring</span>
                <h2>Requirements</h2>
                <ul>
                  {job.requirements.split("\n").filter(Boolean).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
              <div className="contact-note">
                Applications are reviewed by {job.company}. Hiring contact:{" "}
                <a href={`mailto:${job.contactEmail}`}>{job.contactEmail}</a>
              </div>
            </article>

            <aside className="application-card" id="apply">
              <span className="section-kicker">Apply today</span>
              <h2>Submit your application</h2>
              <p>All fields are required. Add a public link to your resume.</p>
              {formError && <div className="message error-message">{formError}</div>}
              {success && (
                <div className="message success-message">
                  {success}
                  <Link href={`/dashboard/candidate?email=${encodeURIComponent(submittedEmail)}`}>
                    Track applications
                  </Link>
                </div>
              )}
              <form className="stack-form" onSubmit={submitApplication}>
                <label>
                  Full name
                  <input name="name" value={form.name} onChange={updateField} required />
                </label>
                <label>
                  Email
                  <input name="email" type="email" value={form.email} onChange={updateField} required />
                </label>
                <label>
                  Phone
                  <input name="phone" value={form.phone} onChange={updateField} required />
                </label>
                <label>
                  Resume link
                  <input name="resumeUrl" type="url" value={form.resumeUrl} onChange={updateField} placeholder="https://drive.google.com/..." required />
                </label>
                <label>
                  Cover letter
                  <textarea name="coverLetter" rows="6" value={form.coverLetter} onChange={updateField} required />
                </label>
                <button className="primary-button" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit application"}
                </button>
              </form>
            </aside>
          </section>
        </>
      )}
      <Footer />
    </main>
  );
}
