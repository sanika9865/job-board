"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JobCard from "@/components/JobCard";
import { ArrowIcon, LocationIcon, SearchIcon } from "@/components/Icons";

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [sources, setSources] = useState(["JobBoard"]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    async function loadJobs() {
      try {
        const response = await fetch("/api/jobs", { cache: "no-store" });
        if (!response.ok) throw new Error("Could not load jobs.");
        const data = await response.json();
        setJobs(data.jobs);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    if (hasSearched) return jobs;

    const queryText = query.trim().toLowerCase();
    const locationText = location.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesQuery =
        !queryText ||
        job.title.toLowerCase().includes(queryText) ||
        job.company.toLowerCase().includes(queryText) ||
        job.description.toLowerCase().includes(queryText);
      const matchesLocation =
        !locationText ||
        job.location.toLowerCase().includes(locationText) ||
        job.mode.toLowerCase().includes(locationText);
      return matchesQuery && matchesLocation;
    });
  }, [jobs, query, location, hasSearched]);

  async function showResults(event) {
    event.preventDefault();
    setSearching(true);
    setError("");
    document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" });

    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (location.trim()) params.set("location", location.trim());
      const response = await fetch(`/api/search?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Search is unavailable.");
      setJobs(data.jobs);
      setSources(data.meta.sources);
      setHasSearched(true);
    } catch (searchError) {
      setError(searchError.message);
    } finally {
      setSearching(false);
    }
  }

  return (
    <main>
      <Header />
      <section className="hero">
        <div className="hero-orb orb-one" />
        <div className="hero-orb orb-two" />
        <div className="hero-content">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Your next chapter starts here
          </span>
          <h1>Find Your <em>Dream Job</em></h1>
          <p>
            Discover opportunities that match your ambition, from companies
            where your best work can thrive.
          </p>

          <form className="search-panel" role="search" onSubmit={showResults}>
            <label className="search-field">
              <SearchIcon />
              <span className="sr-only">Job title or company</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Job title or company"
              />
            </label>
            <span className="search-divider" />
            <label className="search-field location-field">
              <LocationIcon />
              <span className="sr-only">Location</span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="City or remote"
              />
            </label>
            <button className="search-button" type="submit" disabled={searching}>
              {searching ? "Searching..." : "Search jobs"} <ArrowIcon />
            </button>
          </form>

          <div className="popular">
            <span>Popular:</span>
            {["Design", "Engineering", "Marketing"].map((item) => (
              <button key={item} type="button" onClick={() => setQuery(item)}>{item}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="jobs-section" id="jobs">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Current opportunities</span>
            <h2>{hasSearched ? "Search results" : "Find your next role"}</h2>
          </div>
          {!loading && !error && (
            <p>
              {filteredJobs.length} {filteredJobs.length === 1 ? "role" : "roles"}{" "}
              matching your search
            </p>
          )}
        </div>

        {hasSearched && !searching && !error && (
          <div className="search-summary">
            <span>Sources: {sources.join(", ")}</span>
            <button
              onClick={() => {
                setQuery("");
                setLocation("");
                setHasSearched(false);
                setLoading(true);
                fetch("/api/jobs", { cache: "no-store" })
                  .then((response) => response.json())
                  .then((data) => setJobs(data.jobs))
                  .finally(() => setLoading(false));
              }}
            >
              Reset search
            </button>
          </div>
        )}

        {(loading || searching) && (
          <div className="loading-state">
            {searching ? "Searching current listings..." : "Loading opportunities..."}
          </div>
        )}
        {error && <div className="message error-message">{error}</div>}
        {!loading && !searching && !error && filteredJobs.length > 0 && (
          <div className="job-grid">
            {filteredJobs.map((job) => <JobCard job={job} key={job.id} />)}
          </div>
        )}
        {!loading && !searching && !error && filteredJobs.length === 0 && (
          <div className="empty-state">
            <SearchIcon />
            <h3>No jobs found</h3>
            <p>
              Try a broader title, use a country instead of a city, or search
              for remote work.
            </p>
            <button onClick={() => { setQuery(""); setLocation(""); }}>
              Clear search
            </button>
          </div>
        )}
      </section>

      <section className="footer-cta">
        <div>
          <span>For ambitious teams</span>
          <h2>Looking for exceptional talent?</h2>
        </div>
        <Link className="cta-link" href="/post-job">
          Post your first job <ArrowIcon />
        </Link>
      </section>
      <Footer />
    </main>
  );
}
