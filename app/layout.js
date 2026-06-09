import "./globals.css";

export const metadata = {
  title: "JobBoard | Find Your Dream Job",
  description: "Discover exciting career opportunities from leading companies.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
