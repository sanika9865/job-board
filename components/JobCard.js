"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowIcon, LocationIcon } from "./Icons";

const colors = ["violet", "orange", "blue", "green", "pink", "teal"];

function initials(company) {
  return company
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function dateLabel(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

export default function JobCard({ job }) {
  const [message, setMessage] = useState("");
  const color =
    colors[
      job.company.split("").reduce((total, char) => total + char.charCodeAt(0), 0) %
        colors.length
    ];

  function getCandidate() {
    try {
      return JSON.parse(localStorage.getItem("jobboard-profile") || "null");
    } catch {
      return null;
    }
  }

  async function saveForLater() {
    const profile = getCandidate();
    if (!profile?.email) {
      window.location.href = `/profile?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }
    const response = await fetch("/api/saved-jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: profile.email, job }),
    });
    setMessage(response.ok ? "Saved" : "Could not save");
  }

  async function applyExternal() {
    const profile = getCandidate();
    if (!profile?.email) {
      window.location.href = `/profile?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }

    await fetch("/api/applications/external", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || "",
        resumeUrl: profile.resumeUrl || "",
        job,
      }),
    });
    window.open(job.applyUrl, "_blank", "noopener,noreferrer");
    setMessage("Application tracked");
  }

  return (
    <article className="job-card">
      <div className="card-top">
        <div className={`company-logo ${color}`}>{initials(job.company)}</div>
        <div className="card-source">
          {job.source && <span>{job.source}</span>}
          <span className="posted">{dateLabel(job.createdAt)}</span>
        </div>
      </div>
      <div className="job-info">
        <h3>{job.title}</h3>
        <p>{job.company}</p>
      </div>
      <div className="job-meta">
        <span><LocationIcon />{job.location}</span>
        <span className="salary">{job.salary}</span>
      </div>
      <div className="tags">
        <span>{job.type}</span>
        <span>{job.mode}</span>
      </div>
      <div className="card-actions">
        <button className="save-button" onClick={saveForLater}>
          {message === "Saved" ? "Saved" : "Save"}
        </button>
        {job.external ? (
          <button className="details-button" onClick={applyExternal}>
            Apply on The Muse <ArrowIcon />
          </button>
        ) : (
          <Link className="details-button" href={`/jobs/${job.id}`}>
            View and apply <ArrowIcon />
          </Link>
        )}
      </div>
      {message && message !== "Saved" && (
        <span className="card-message">{message}</span>
      )}
    </article>
  );
}
