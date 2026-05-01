import { useState } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { Send, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Invalid email").max(200),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(5, "Message too short").max(5000),
});

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      subject: fd.get("subject") || undefined,
      message: fd.get("message"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject ?? null,
      message: parsed.data.message,
      read: false,
    });
    setLoading(false);
    if (error) {
      toast.error("Failed to send. Try again.");
      return;
    }
    setSent(true);
    (e.target as HTMLFormElement).reset();
    toast.success("Message sent — talk soon!");
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border border-border bg-card p-12 text-center"
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-acid/20 grid place-items-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-foreground" />
        </div>
        <h3 className="font-display font-bold text-2xl">Message received!</h3>
        <p className="text-muted-foreground mt-2">I'll reply within 24 hours.</p>
        <button onClick={() => setSent(false)} className="mt-6 text-sm text-primary hover:underline">Send another</button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Name" name="name" placeholder="Your name" />
        <Field label="Email" name="email" type="email" placeholder="you@example.com" />
      </div>
      <Field label="Subject" name="subject" placeholder="What's this about?" required={false} />
      <div>
        <label className="text-sm font-medium block mb-2">Message</label>
        <textarea
          name="message"
          rows={6}
          required
          maxLength={5000}
          placeholder="Tell me about your project…"
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-primary text-white font-medium shadow-glow hover:scale-[1.02] transition-transform disabled:opacity-60"
      >
        <Send className="w-4 h-4" />
        {loading ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

function Field({ label, name, type = "text", placeholder, required = true }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-sm font-medium block mb-2">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
      />
    </div>
  );
}
