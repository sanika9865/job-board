import Link from "next/link";
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

function timeAgo(date) {
  const days = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / 86400000),
  );
  if (days === 0) return "Today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function JobCard({ job }) {
  const color =
    colors[
      job.company.split("").reduce((total, char) => total + char.charCodeAt(0), 0) %
        colors.length
    ];

  return (
    <article className="job-card">
      <div className="card-top">
        <div className={`company-logo ${color}`}>{initials(job.company)}</div>
        <div className="card-source">
          {job.source && <span>{job.source}</span>}
          <span className="posted">{timeAgo(job.createdAt)}</span>
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
      {job.external ? (
        <a
          className="details-button"
          href={job.applyUrl}
          target="_blank"
          rel="noreferrer"
        >
          View and apply <ArrowIcon />
        </a>
      ) : (
        <Link className="details-button" href={`/jobs/${job.id}`}>
          View details <ArrowIcon />
        </Link>
      )}
    </article>
  );
}
