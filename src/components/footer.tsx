import { Link } from "@tanstack/react-router";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import { useProfile } from "@/hooks/use-portfolio-data";

export function Footer() {
  const { data: profile } = useProfile();
  return (
    <footer className="border-t border-border/40 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-acid animate-pulse" />
          <p className="text-sm text-muted-foreground font-mono">
            © {new Date().getFullYear()} {profile?.full_name ?? "Portfolio"} — built with care.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {profile?.github_url && <SocialIcon href={profile.github_url}><Github className="w-4 h-4" /></SocialIcon>}
          {profile?.twitter_url && <SocialIcon href={profile.twitter_url}><Twitter className="w-4 h-4" /></SocialIcon>}
          {profile?.linkedin_url && <SocialIcon href={profile.linkedin_url}><Linkedin className="w-4 h-4" /></SocialIcon>}
          {profile?.email && <SocialIcon href={`mailto:${profile.email}`}><Mail className="w-4 h-4" /></SocialIcon>}
          <Link to="/admin" className="ml-2 text-xs text-muted-foreground hover:text-foreground font-mono">
            admin →
          </Link>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="grid place-items-center w-9 h-9 rounded-full border border-border hover:border-primary hover:text-primary transition-colors"
    >
      {children}
    </a>
  );
}
