type BadgeKind = "exam" | "holiday" | "no_class" | "other" | "session";

const KIND_CLASSES: Record<BadgeKind, string> = {
  exam: "bg-red-100 text-red-800",
  holiday: "bg-stone-100 text-stone-600",
  no_class: "bg-stone-100 text-stone-600",
  other: "bg-amber-100 text-amber-800",
  session: "",
};

export function EventBadge({
  kind,
  label,
  color,
}: {
  kind: BadgeKind;
  label: string;
  color?: string;
}) {
  const style = kind === "session" && color ? { backgroundColor: `${color}22`, color } : undefined;

  return (
    <span
      className={`block truncate rounded px-1.5 py-0.5 text-xs font-medium ${KIND_CLASSES[kind]}`}
      style={style}
      title={label}
    >
      {label}
    </span>
  );
}
