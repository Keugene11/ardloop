import type { Services, ServiceType, ServiceEntry } from "@/types";
import { SERVICE_TYPES, SERVICE_LABELS } from "@/types";

export function ServicesDisplay({ services }: { services: Services }) {
  const hasAny = Object.values(services).some((s) => s);
  if (!hasAny) return null;

  return (
    <div className="w-full mt-4">
      <h3 className="text-[13px] font-semibold uppercase tracking-wide text-text-muted mb-2 text-left">
        Services
      </h3>
      <div className="space-y-2">
        {SERVICE_TYPES.map((type) => {
          const entry = services[type];
          if (!entry) return null;
          return <ServiceBadge key={type} type={type} entry={entry} />;
        })}
      </div>
    </div>
  );
}

function ServiceBadge({ type, entry }: { type: ServiceType; entry: ServiceEntry }) {
  const isOffering = entry.mode === "offering";
  return (
    <div
      className={`rounded-xl px-3.5 py-2.5 ${
        isOffering
          ? "bg-green-50 border border-green-200"
          : "bg-blue-50 border border-blue-200"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`text-[11px] font-semibold uppercase tracking-wide ${
            isOffering ? "text-green-600" : "text-blue-600"
          }`}
        >
          {isOffering ? "Offering" : "Looking for"}
        </span>
        <span className="text-[14px] font-semibold">{SERVICE_LABELS[type]}</span>
      </div>
      {entry.details && (
        <p className="text-[13px] text-text-muted mt-0.5">{entry.details}</p>
      )}
    </div>
  );
}
