"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Services, ServiceType, ServiceMode, ServiceEntry } from "@/types";
import { SERVICE_TYPES, SERVICE_LABELS } from "@/types";

export function ServicesEditor({
  userId,
  services: initialServices,
}: {
  userId: string;
  services: Services;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Services>(initialServices);
  const [saving, setSaving] = useState(false);

  const hasAny = Object.values(initialServices).some((s) => s);

  const toggleService = (type: ServiceType, mode: ServiceMode) => {
    setDraft((prev) => {
      const current = prev[type];
      if (current?.mode === mode) {
        const next = { ...prev };
        delete next[type];
        return next;
      }
      return { ...prev, [type]: { mode, details: current?.details || "" } };
    });
  };

  const updateDetails = (type: ServiceType, details: string) => {
    setDraft((prev) => {
      const current = prev[type];
      if (!current) return prev;
      return { ...prev, [type]: { ...current, details } };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    // Clean out empty entries
    const cleaned: Services = {};
    for (const [key, val] of Object.entries(draft)) {
      if (val) cleaned[key as ServiceType] = val;
    }
    await supabase
      .from("profiles")
      .update({ services: Object.keys(cleaned).length > 0 ? cleaned : null })
      .eq("id", userId);
    setSaving(false);
    setEditing(false);
    router.refresh();
  };

  const handleCancel = () => {
    setDraft(initialServices);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[13px] font-semibold uppercase tracking-wide text-text-muted">
            Services
          </h3>
          <button
            onClick={() => setEditing(true)}
            className="p-1 press text-text-muted/40"
          >
            <Pencil size={14} strokeWidth={1.5} />
          </button>
        </div>
        {hasAny ? (
          <div className="space-y-2">
            {SERVICE_TYPES.map((type) => {
              const entry = initialServices[type];
              if (!entry) return null;
              return (
                <ServiceBadge key={type} type={type} entry={entry} />
              );
            })}
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="w-full text-left press"
          >
            <div className="bg-bg-input/50 border border-dashed border-border rounded-xl px-4 py-4">
              <p className="text-[14px] text-text-muted/60 font-medium">
                Tap to add services
              </p>
              <p className="text-[12px] text-text-muted/40 mt-0.5">
                Let people know what you offer or need — tutoring, driving, babysitting, pet watching.
              </p>
            </div>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mb-5">
      <h3 className="text-[13px] font-semibold uppercase tracking-wide text-text-muted mb-3">
        Services
      </h3>
      <div className="space-y-3">
        {SERVICE_TYPES.map((type) => {
          const entry = draft[type];
          return (
            <div key={type} className="bg-bg-card border border-border rounded-xl px-4 py-3">
              <p className="text-[14px] font-semibold mb-2">{SERVICE_LABELS[type]}</p>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => toggleService(type, "offering")}
                  className={`px-3 py-1.5 rounded-full text-[13px] font-medium press transition-colors ${
                    entry?.mode === "offering"
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-bg-input text-text-muted border border-transparent"
                  }`}
                >
                  Offering
                </button>
                <button
                  type="button"
                  onClick={() => toggleService(type, "looking")}
                  className={`px-3 py-1.5 rounded-full text-[13px] font-medium press transition-colors ${
                    entry?.mode === "looking"
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-bg-input text-text-muted border border-transparent"
                  }`}
                >
                  Looking
                </button>
              </div>
              {entry && (
                <input
                  type="text"
                  value={entry.details}
                  onChange={(e) => updateDetails(type, e.target.value)}
                  placeholder="Add details (rates, availability, subjects...)"
                  maxLength={200}
                  className="w-full bg-bg-input rounded-lg px-3 py-2 text-[13px] placeholder:text-text-muted/40 outline-none focus:ring-1 focus:ring-text-muted/30 transition-all"
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 bg-[#1a1a1a] text-white px-4 py-2 rounded-full font-semibold text-[13px] press disabled:opacity-30"
        >
          <Check size={14} strokeWidth={2} />
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={handleCancel}
          className="flex items-center gap-1.5 text-[13px] text-text-muted px-3 py-2 press"
        >
          <X size={14} strokeWidth={2} />
          Cancel
        </button>
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
