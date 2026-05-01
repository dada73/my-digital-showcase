import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profile").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useProjects(featuredOnly = false) {
  return useQuery({
    queryKey: ["projects", featuredOnly],
    queryFn: async () => {
      let q = supabase.from("projects").select("*").order("display_order", { ascending: true });
      if (featuredOnly) q = q.eq("featured", true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSkills() {
  return useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const { data, error } = await supabase.from("skills").select("*").order("display_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useBlogPosts(publishedOnly = true) {
  return useQuery({
    queryKey: ["blog_posts", publishedOnly],
    queryFn: async () => {
      let q = supabase.from("blog_posts").select("id,title,slug,excerpt,cover_url,published,reading_minutes,published_at,views,created_at").order("published_at", { ascending: false, nullsFirst: false });
      if (publishedOnly) q = q.eq("published", true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useTrackPageView(path: string) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const referrer = document.referrer || null;
    void supabase.from("page_views").insert({ path, referrer });
  }, [path]);
}
