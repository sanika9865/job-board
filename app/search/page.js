"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JobCard from "@/components/JobCard";
import { LocationIcon, SearchIcon } from "@/components/Icons";

export default function SearchPage({ searchParams }) {
  const initial = use(searchParams);
  const router = useRouter();
  const [query, setQuery] = useState(initial.q || "");
  const [location, setLocation] = useState(initial.location || "");
  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function runSearch(role, region) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (role.trim()) params.set("q", role.trim());
      if (region.trim()) params.set("location", region.trim());
      const response = await fetch(`/api/search?${params}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Search failed.");
      setJobs(data.jobs);
      setMeta(data.meta);
    } catch (searchError) {
      setError(searchError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runSearch(initial.q || "", initial.location || "");
  }, [initial.q, initial.location]);

  function submit(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (location.trim()) params.set("location", location.trim());
    router.push(`/search?${params}`);
    runSearch(query, location);
  }

  return (
    <main>
      <Header />
      <section className="search-page-hero">
        <div>
          <span className="section-kicker">Search The Muse and JobBoard</span>
          <h1>Explore opportunities</h1>
        </div>
        <form className="results-search" onSubmit={submit}>
          <label><SearchIcon /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Role, skill, or company" /></label>
          <label><LocationIcon /><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City, country, or Flexible / Remote" /></label>
          <button disabled={loading}>{loading ? "Searching..." : "Search"}</button>
        </form>
      </section>

      <section className="search-results-shell">
        <div className="results-heading">
          <div>
            <h2>{loading ? "Finding matches..." : `${jobs.length} opportunities found`}</h2>
            {meta?.category && <p>Matched to the “{meta.category}” category</p>}
          </div>
          <span>Results from {meta?.sources?.join(" and ") || "JobBoard"}</span>
        </div>
        {loading && (
          <div className="search-loader">
            <span />
            <h3>Searching current job listings</h3>
            <p>Matching your role and location across available opportunities.</p>
          </div>
        )}
        {error && <div className="message error-message">{error}</div>}
        {!loading && !error && jobs.length > 0 && (
          <div className="job-grid">
            {jobs.map((job) => <JobCard job={job} key={job.id} />)}
          </div>
        )}
        {!loading && !error && jobs.length === 0 && (
          <div className="empty-state">
            <h3>No exact matches found</h3>
            <p>Try a broader role category or use an exact city such as “New York, NY”.</p>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
