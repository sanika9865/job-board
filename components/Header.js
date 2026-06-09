import Link from "next/link";

export default function Header() {
  return (
    <header className="navbar">
      <Link className="logo" href="/" aria-label="JobBoard home">
        <span className="logo-mark"><span /></span>
        JobBoard
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/#jobs">Find jobs</Link>
        <Link href="/dashboard/candidate">My applications</Link>
        <Link href="/profile">Profile</Link>
        <Link href="/dashboard/employer">Employer dashboard</Link>
      </nav>
      <div className="nav-actions">
        <Link className="text-button nav-link-button" href="/profile">
          My profile
        </Link>
        <Link className="post-button nav-link-button" href="/post-job">
          Post a job
        </Link>
      </div>
    </header>
  );
}
