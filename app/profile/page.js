"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const emptyProfile = {
  name: "",
  email: "",
  phone: "",
  headline: "",
  location: "",
  targetRole: "",
  experienceLevel: "Mid Level",
  skills: "",
  bio: "",
  preferredMode: "Any",
  linkedinUrl: "",
  portfolioUrl: "",
  resumeUrl: "",
};

export default function ProfilePage({ searchParams }) {
  const query = use(searchParams);
  const router = useRouter();
  const [profile, setProfile] = useState(emptyProfile);
  const [lookupEmail, setLookupEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("jobboard-profile") || "null");
      if (stored) {
        setProfile((current) => ({ ...current, ...stored }));
        setLookupEmail(stored.email || "");
      }
    } catch {}
  }, []);

  function update(event) {
    setProfile((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function loadProfile(event) {
    event.preventDefault();
    setError("");
    const response = await fetch(`/api/profile?email=${encodeURIComponent(lookupEmail)}`);
    const data = await response.json();
    if (!response.ok || !data.profile) {
      setError(data.error || "No profile was found for that email.");
      return;
    }
    setProfile((current) => ({ ...current, ...data.profile }));
    localStorage.setItem("jobboard-profile", JSON.stringify(data.profile));
    setMessage("Profile loaded.");
  }

  async function uploadResume(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("resume", file);
    const response = await fetch("/api/upload/resume", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) setError(data.error);
    else {
      setProfile((current) => ({ ...current, resumeUrl: data.url }));
      setMessage("Resume uploaded. Save your profile to keep it attached.");
    }
    setUploading(false);
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Could not save profile.");
      setSaving(false);
      return;
    }
    localStorage.setItem("jobboard-profile", JSON.stringify(data.profile));
    setProfile((current) => ({ ...current, ...data.profile }));
    setMessage("Profile saved. Recommendations are now personalized.");
    setSaving(false);
    if (query.next) router.push(query.next);
  }

  return (
    <main>
      <Header />
      <section className="profile-banner">
        <div className="profile-avatar">
          {(profile.name || "You").split(" ").map((part) => part[0]).join("").slice(0, 2)}
        </div>
        <div>
          <span className="section-kicker">Candidate profile</span>
          <h1>{profile.name || "Build your professional identity"}</h1>
          <p>{profile.headline || "Your profile powers recommendations, saved jobs, and applications."}</p>
        </div>
      </section>

      <section className="profile-shell">
        <aside className="profile-sidebar">
          <h2>Returning candidate?</h2>
          <p>Load your local profile using the email you saved it with.</p>
          <form onSubmit={loadProfile}>
            <input type="email" value={lookupEmail} onChange={(event) => setLookupEmail(event.target.value)} placeholder="you@example.com" required />
            <button className="secondary-button">Load profile</button>
          </form>
          <div className="profile-completion">
            <strong>{profile.resumeUrl ? "Profile ready" : "Add your resume"}</strong>
            <span>{profile.resumeUrl ? "Applications can reuse your details." : "PDF, up to 5 MB."}</span>
          </div>
        </aside>

        <form className="form-card profile-form" onSubmit={saveProfile}>
          {error && <div className="message error-message">{error}</div>}
          {message && <div className="message success-message">{message}</div>}
          <div className="form-grid">
            <label>Full name<input name="name" value={profile.name} onChange={update} required /></label>
            <label>Email<input name="email" type="email" value={profile.email} onChange={update} required /></label>
            <label>Phone<input name="phone" value={profile.phone} onChange={update} placeholder="+91..." /></label>
            <label>Location<input name="location" value={profile.location} onChange={update} placeholder="Mumbai, India" required /></label>
            <label className="full-field">Professional headline<input name="headline" value={profile.headline} onChange={update} placeholder="Frontend engineer building accessible products" required /></label>
            <label>Target role<input name="targetRole" value={profile.targetRole} onChange={update} placeholder="Software Engineer" required /></label>
            <label>
              Experience level
              <select name="experienceLevel" value={profile.experienceLevel} onChange={update}>
                <option>Entry Level</option><option>Mid Level</option><option>Senior Level</option><option>Management</option>
              </select>
            </label>
            <label>
              Preferred work mode
              <select name="preferredMode" value={profile.preferredMode} onChange={update}>
                <option>Any</option><option>Remote</option><option>Hybrid</option><option>On-site</option>
              </select>
            </label>
            <label>LinkedIn URL<input name="linkedinUrl" type="url" value={profile.linkedinUrl} onChange={update} /></label>
            <label className="full-field">Skills<input name="skills" value={profile.skills} onChange={update} placeholder="React, JavaScript, UI design, communication" required /></label>
            <label className="full-field">About you<textarea name="bio" rows="5" value={profile.bio} onChange={update} placeholder="Share your experience, interests, and the work you want to do next." required /></label>
            <label>Portfolio URL<input name="portfolioUrl" type="url" value={profile.portfolioUrl} onChange={update} /></label>
            <label>
              Resume
              <input type="file" accept="application/pdf" onChange={uploadResume} />
              <small>{uploading ? "Uploading..." : profile.resumeUrl ? "Resume attached" : "Upload a PDF"}</small>
            </label>
          </div>
          <button className="primary-button" disabled={saving || uploading}>
            {saving ? "Saving..." : "Save profile"}
          </button>
        </form>
      </section>
      <Footer />
    </main>
  );
}
