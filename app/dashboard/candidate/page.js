"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JobCard from "@/components/JobCard";

export default function CandidateDashboard() {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      let stored = null;
      try {
        stored = JSON.parse(localStorage.getItem("jobboard-profile") || "null");
      } catch {}
      if (!stored?.email) {
        setLoading(false);
        return;
      }
      setProfile(stored);

      const recommendationLocation =
        stored.preferredMode === "Remote" ? "Flexible / Remote" : stored.location;
      const [applicationsResponse, savedResponse, recommendationsResponse] =
        await Promise.all([
          fetch(`/api/applications?email=${encodeURIComponent(stored.email)}`, { cache: "no-store" }),
          fetch(`/api/saved-jobs?email=${encodeURIComponent(stored.email)}`, { cache: "no-store" }),
          fetch(`/api/search?q=${encodeURIComponent(stored.targetRole)}&location=${encodeURIComponent(recommendationLocation || "")}`, { cache: "no-store" }),
        ]);
      const applicationsData = await applicationsResponse.json();
      const savedData = await savedResponse.json();
      const recommendationsData = await recommendationsResponse.json();
      setApplications(applicationsData.applications || []);
      setSavedJobs(savedData.savedJobs || []);
      setRecommendations((recommendationsData.jobs || []).slice(0, 6));
      setLoading(false);
    }
    load();
  }, []);

  async function removeSaved(jobId) {
    await fetch("/api/saved-jobs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: profile.email, jobId }),
    });
    setSavedJobs((current) => current.filter((item) => item.job.id !== jobId));
  }

  return (
    <main>
      <Header />
      <section className="candidate-hero">
        <div>
          <span className="section-kicker">Your career network</span>
          <h1>{profile ? `Welcome back, ${profile.name.split(" ")[0]}` : "Your candidate space"}</h1>
          <p>{profile ? `${profile.headline} · ${profile.location}` : "Create a profile to unlock recommendations, saved jobs, and application tracking."}</p>
        </div>
        <Link className="primary-button" href="/profile">{profile ? "Edit profile" : "Create profile"}</Link>
      </section>

      <section className="dashboard-shell candidate-dashboard">
        {loading && <div className="loading-state">Building your personalized feed...</div>}
        {!loading && !profile && (
          <div className="empty-state">
            <h3>Start with your profile</h3>
            <p>Add your skills, role, preferred location, and résumé to personalize JobBoard.</p>
            <Link className="primary-button" href="/profile">Create my profile</Link>
          </div>
        )}
        {!loading && profile && (
          <>
            <div className="candidate-stats">
              <div><strong>{recommendations.length}</strong><span>Fresh matches</span></div>
              <div><strong>{savedJobs.length}</strong><span>Saved jobs</span></div>
              <div><strong>{applications.length}</strong><span>Applications</span></div>
            </div>

            <section className="dashboard-section">
              <div className="dashboard-title">
                <div><span className="section-kicker">For you</span><h2>Recommended jobs</h2></div>
                <Link href={`/search?q=${encodeURIComponent(profile.targetRole)}&location=${encodeURIComponent(profile.location)}`}>See all matches</Link>
              </div>
              {recommendations.length ? (
                <div className="job-grid">{recommendations.map((job) => <JobCard job={job} key={job.id} />)}</div>
              ) : <div className="compact-empty empty-state"><h3>No recommendations yet</h3><p>Try broadening your target role or preferred location.</p></div>}
            </section>

            <section className="dashboard-section">
              <div className="dashboard-title"><div><span className="section-kicker">Reading list</span><h2>Saved for later</h2></div></div>
              {savedJobs.length ? (
                <div className="saved-list">
                  {savedJobs.map(({ id, job }) => (
                    <article className="saved-row" key={id}>
                      <div><h3>{job.title}</h3><p>{job.company} · {job.location}</p></div>
                      <div className="row-actions">
                        {job.external ? <a href={job.applyUrl} target="_blank" rel="noreferrer">View</a> : <Link href={`/jobs/${job.id}`}>View</Link>}
                        <button className="danger-button" onClick={() => removeSaved(job.id)}>Remove</button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : <div className="compact-empty empty-state"><h3>No saved jobs</h3><p>Use Save on any job card to build your shortlist.</p></div>}
            </section>

            <section className="dashboard-section">
              <div className="dashboard-title"><div><span className="section-kicker">Your activity</span><h2>Applications</h2></div></div>
              {applications.length ? (
                <div className="application-list">
                  {applications.map((application) => (
                    <article className="application-row" key={application.id}>
                      <div>
                        <span className="status-pill">{application.status}</span>
                        <h2>{application.job?.title || "Position unavailable"}</h2>
                        <p>{application.job?.company}</p>
                      </div>
                      <div className="application-row-meta">
                        <span>{new Date(application.createdAt).toLocaleDateString()}</span>
                        {application.external && application.job?.applyUrl && <a href={application.job.applyUrl} target="_blank" rel="noreferrer">Continue on The Muse</a>}
                      </div>
                    </article>
                  ))}
                </div>
              ) : <div className="compact-empty empty-state"><h3>No applications yet</h3><p>Jobs you apply to or track will appear here.</p></div>}
            </section>
          </>
        )}
      </section>
      <Footer />
    </main>
  );
}
