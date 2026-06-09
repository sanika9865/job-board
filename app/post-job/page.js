"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const initialForm = {
  title: "",
  company: "",
  location: "",
  salary: "",
  type: "Full-time",
  mode: "Hybrid",
  contactEmail: "",
  description: "",
  requirements: "",
};

export default function PostJobPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function submitJob(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not post the job.");
      router.push(`/jobs/${data.job.id}?posted=1`);
    } catch (submitError) {
      setError(submitError.message);
      setSubmitting(false);
    }
  }

  return (
    <main>
      <Header />
      <section className="page-hero">
        <span className="section-kicker">Employer tools</span>
        <h1>Post a new opportunity</h1>
        <p>Complete the details below and your listing will appear immediately.</p>
      </section>
      <section className="form-shell">
        <form className="form-card" onSubmit={submitJob}>
          {error && <div className="message error-message">{error}</div>}
          <div className="form-grid">
            <label>
              Job title
              <input name="title" value={form.title} onChange={updateField} placeholder="Senior Product Designer" required />
            </label>
            <label>
              Company
              <input name="company" value={form.company} onChange={updateField} placeholder="Acme Inc." required />
            </label>
            <label>
              Location
              <input name="location" value={form.location} onChange={updateField} placeholder="Mumbai, India" required />
            </label>
            <label>
              Salary range
              <input name="salary" value={form.salary} onChange={updateField} placeholder="$80k - $110k" required />
            </label>
            <label>
              Job type
              <select name="type" value={form.type} onChange={updateField}>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </label>
            <label>
              Work mode
              <select name="mode" value={form.mode} onChange={updateField}>
                <option>Hybrid</option>
                <option>Remote</option>
                <option>On-site</option>
              </select>
            </label>
            <label className="full-field">
              Hiring contact email
              <input name="contactEmail" type="email" value={form.contactEmail} onChange={updateField} placeholder="hiring@company.com" required />
            </label>
            <label className="full-field">
              Job description
              <textarea name="description" value={form.description} onChange={updateField} rows="6" placeholder="Describe the role, team, and impact..." required />
            </label>
            <label className="full-field">
              Requirements
              <textarea name="requirements" value={form.requirements} onChange={updateField} rows="6" placeholder={"List one requirement per line..."} required />
            </label>
          </div>
          <button className="primary-button" disabled={submitting}>
            {submitting ? "Publishing..." : "Publish job"}
          </button>
        </form>
      </section>
      <Footer />
    </main>
  );
}
