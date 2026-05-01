import { motion } from "framer-motion";
import { useSkills } from "@/hooks/use-portfolio-data";

export function SkillsSection() {
  const { data: skills = [] } = useSkills();
  const grouped = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s);
    return acc;
  }, {});

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Object.entries(grouped).map(([cat, items], gi) => (
        <motion.div
          key={cat}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: gi * 0.1 }}
          className="rounded-3xl border border-border bg-card p-6"
        >
          <h3 className="font-display font-bold text-lg mb-5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gradient-primary" />
            {cat}
          </h3>
          <div className="space-y-4">
            {items.map((s) => (
              <div key={s.id}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium">{s.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{s.percentage}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${s.percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    className="h-full bg-gradient-primary rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
