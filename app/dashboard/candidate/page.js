"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function CandidateDashboard({ searchParams }) {
  const query = use(searchParams);
  const [email, setEmail] = useState(query.email || "");
  const [applications, setApplications] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadApplications(targetEmail) {
    if (!targetEmail.trim()) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/applications?email=${encodeURIComponent(targetEmail.trim())}`,
        { cache: "no-store" },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load applications.");
      setApplications(data.applications);
      setSearched(true);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (query.email) loadApplications(query.email);
  }, [query.email]);

  function search(event) {
    event.preventDefault();
    loadApplications(email);
  }

  return (
    <main>
      <Header />
      <section className="page-hero">
        <span className="section-kicker">Candidate dashboard</span>
        <h1>Track your applications</h1>
        <p>Enter the email used when applying to see your latest status.</p>
      </section>
      <section className="dashboard-shell">
        <form className="lookup-form" onSubmit={search}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
          <button className="primary-button" disabled={loading}>
            {loading ? "Looking up..." : "Find applications"}
          </button>
        </form>
        {error && <div className="message error-message">{error}</div>}
        {searched && applications.length === 0 && (
          <div className="empty-state compact-empty">
            <h3>No applications found</h3>
            <p>Check the email address or browse open roles to apply.</p>
            <Link className="secondary-button" href="/#jobs">Browse jobs</Link>
          </div>
        )}
        <div className="application-list">
          {applications.map((application) => (
            <article className="application-row" key={application.id}>
              <div>
                <span className={`status-pill status-${application.status.toLowerCase()}`}>
                  {application.status}
                </span>
                <h2>{application.job?.title || "Closed position"}</h2>
                <p>{application.job?.company || "This listing was removed"}</p>
              </div>
              <div className="application-row-meta">
                <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
                {application.job && (
                  <Link href={`/jobs/${application.job.id}`}>View job</Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
