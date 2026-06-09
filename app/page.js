"use client";

import { useEffect, useMemo, useState } from "react";

const jobs = [
  {
    id: 1,
    title: "Senior Product Designer",
    company: "Northstar Labs",
    location: "San Francisco, CA",
    salary: "$135k - $165k",
    type: "Full-time",
    mode: "Hybrid",
    initials: "NL",
    color: "violet",
    posted: "2d ago",
    description:
      "Lead product design for tools used by thousands of modern teams. You will partner with product and engineering from discovery through delivery.",
  },
  {
    id: 2,
    title: "Frontend Developer",
    company: "Arcade Studio",
    location: "New York, NY",
    salary: "$110k - $140k",
    type: "Full-time",
    mode: "Remote",
    initials: "AS",
    color: "orange",
    posted: "3d ago",
    description:
      "Build polished, accessible interfaces for a fast-growing creative platform using React, TypeScript, and a thoughtful design system.",
  },
  {
    id: 3,
    title: "Marketing Manager",
    company: "Brightline",
    location: "Austin, TX",
    salary: "$90k - $115k",
    type: "Full-time",
    mode: "On-site",
    initials: "BL",
    color: "blue",
    posted: "4d ago",
    description:
      "Own integrated campaigns across content, lifecycle, and paid channels while helping shape the voice of a growing consumer brand.",
  },
  {
    id: 4,
    title: "Backend Engineer",
    company: "CloudPeak",
    location: "Remote",
    salary: "$125k - $155k",
    type: "Full-time",
    mode: "Remote",
    initials: "CP",
    color: "green",
    posted: "5d ago",
    description:
      "Design reliable APIs and distributed systems that power our global infrastructure platform. Experience with Node.js or Go is welcome.",
  },
  {
    id: 5,
    title: "Data Analyst",
    company: "Metric House",
    location: "Chicago, IL",
    salary: "$82k - $105k",
    type: "Full-time",
    mode: "Hybrid",
    initials: "MH",
    color: "pink",
    posted: "1w ago",
    description:
      "Turn complex customer data into clear insights and dashboards that help teams make confident, evidence-based decisions.",
  },
  {
    id: 6,
    title: "UX Researcher",
    company: "Morrow Health",
    location: "Boston, MA",
    salary: "$105k - $130k",
    type: "Full-time",
    mode: "Hybrid",
    initials: "MH",
    color: "teal",
    posted: "1w ago",
    description:
      "Plan and lead generative and evaluative research that improves digital healthcare experiences for patients and providers.",
  },
];

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
  </svg>
);

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14m-5-5 5 5-5 5" />
  </svg>
);

export default function Home() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  const filteredJobs = useMemo(() => {
    const queryText = query.trim().toLowerCase();
    const locationText = location.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesQuery =
        !queryText ||
        job.title.toLowerCase().includes(queryText) ||
        job.company.toLowerCase().includes(queryText);
      const matchesLocation =
        !locationText || job.location.toLowerCase().includes(locationText);

      return matchesQuery && matchesLocation;
    });
  }, [query, location]);

  useEffect(() => {
    document.body.style.overflow = selectedJob ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedJob]);

  return (
    <main>
      <header className="navbar">
        <a className="logo" href="#" aria-label="JobBoard home">
          <span className="logo-mark">
            <span />
          </span>
          JobBoard
        </a>
        <nav aria-label="Main navigation">
          <a href="#jobs">Find jobs</a>
          <a href="#companies">Companies</a>
          <a href="#resources">Resources</a>
        </nav>
        <div className="nav-actions">
          <button className="text-button">Sign in</button>
          <button className="post-button">Post a job</button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-orb orb-one" />
        <div className="hero-orb orb-two" />
        <div className="hero-content">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Your next chapter starts here
          </span>
          <h1>
            Find Your <em>Dream Job</em>
          </h1>
          <p>
            Discover opportunities that match your ambition, from companies
            where your best work can thrive.
          </p>

          <div className="search-panel" role="search">
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
            <button
              className="search-button"
              onClick={() =>
                document
                  .getElementById("jobs")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Search jobs
              <ArrowIcon />
            </button>
          </div>

          <div className="popular">
            <span>Popular:</span>
            {["Product Design", "Engineering", "Marketing"].map((item) => (
              <button key={item} onClick={() => setQuery(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="jobs-section" id="jobs">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Handpicked opportunities</span>
            <h2>Featured jobs</h2>
          </div>
          <p>
            {filteredJobs.length} {filteredJobs.length === 1 ? "role" : "roles"}{" "}
            matching your search
          </p>
        </div>

        {filteredJobs.length > 0 ? (
          <div className="job-grid">
            {filteredJobs.map((job) => (
              <article className="job-card" key={job.id}>
                <div className="card-top">
                  <div className={`company-logo ${job.color}`}>
                    {job.initials}
                  </div>
                  <span className="posted">{job.posted}</span>
                </div>
                <div className="job-info">
                  <h3>{job.title}</h3>
                  <p>{job.company}</p>
                </div>
                <div className="job-meta">
                  <span>
                    <LocationIcon />
                    {job.location}
                  </span>
                  <span className="salary">{job.salary}</span>
                </div>
                <div className="tags">
                  <span>{job.type}</span>
                  <span>{job.mode}</span>
                </div>
                <button
                  className="details-button"
                  onClick={() => setSelectedJob(job)}
                >
                  View details
                  <ArrowIcon />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <SearchIcon />
            <h3>No jobs found</h3>
            <p>Try a different role, company, or location.</p>
            <button
              onClick={() => {
                setQuery("");
                setLocation("");
              }}
            >
              Clear search
            </button>
          </div>
        )}
      </section>

      <section className="footer-cta" id="companies">
        <div>
          <span>For ambitious teams</span>
          <h2>Looking for exceptional talent?</h2>
        </div>
        <button>Post your first job <ArrowIcon /></button>
      </section>

      <footer id="resources">
        <a className="logo footer-logo" href="#">
          <span className="logo-mark"><span /></span>
          JobBoard
        </a>
        <p>Better work starts with the right opportunity.</p>
        <span>© 2026 JobBoard</span>
      </footer>

      {selectedJob && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedJob(null);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              className="close-button"
              onClick={() => setSelectedJob(null)}
              aria-label="Close job details"
            >
              ×
            </button>
            <div className={`company-logo ${selectedJob.color}`}>
              {selectedJob.initials}
            </div>
            <span className="section-kicker">{selectedJob.company}</span>
            <h2 id="modal-title">{selectedJob.title}</h2>
            <div className="modal-meta">
              <span>{selectedJob.location}</span>
              <span>{selectedJob.salary}</span>
              <span>{selectedJob.type}</span>
            </div>
            <p>{selectedJob.description}</p>
            <button className="apply-button">
              Apply for this role
              <ArrowIcon />
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
