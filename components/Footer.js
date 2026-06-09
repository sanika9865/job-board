import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <Link className="logo footer-logo" href="/">
        <span className="logo-mark"><span /></span>
        JobBoard
      </Link>
      <p>Better work starts with the right opportunity.</p>
      <span>Copyright 2026 JobBoard</span>
    </footer>
  );
}
