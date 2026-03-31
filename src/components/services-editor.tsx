"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Pencil, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Services, ServiceType, ServiceMode, ServiceEntry } from "@/types";
import { SERVICE_TYPES, SERVICE_LABELS, SERVICE_ICONS } from "@/types";

export function ServicesEditor({
  userId,
  services: initialServices,
  servicesPaused: initialPaused,
}: {
  userId: string;
  services: Services;
  servicesPaused: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Services>(initialServices);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<ServiceType | null>(null);
  const [paused, setPaused] = useState(initialPaused);
  const [togglingPause, setTogglingPause] = useState(false);

  const handleTogglePause = async () => {
    setTogglingPause(true);
    const newVal = !paused;
    setPaused(newVal);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ services_paused: newVal })
      .eq("id", userId);
    setTogglingPause(false);
    router.refresh();
  };

  const toggleService = (type: ServiceType, mode: ServiceMode) => {
    setDraft((prev) => {
      const current = prev[type];
      // If same mode tapped again, do nothing — use Remove button to clear
      if (current?.mode === mode) return prev;
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
        <button
          type="button"
          onClick={handleTogglePause}
          disabled={togglingPause}
          className="flex items-center gap-3 mb-3 press w-full"
        >
          <div
            className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 ${
              paused ? "bg-orange-400" : "bg-bg-input border border-border"
            }`}
          >
            <div
              className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
                paused ? "translate-x-[20px]" : "translate-x-[2px]"
              }`}
            />
          </div>
          <span className={`text-[13px] font-medium ${paused ? "text-orange-600" : "text-text-muted"}`}>
            {paused ? "Not available right now" : "Mark as unavailable"}
          </span>
        </button>

        <div className={`space-y-2 ${paused ? "opacity-40" : ""}`}>
          {SERVICE_TYPES.map((type) => {
            const entry = initialServices[type];
            return <ServiceBadge key={type} type={type} entry={entry || null} onEdit={() => setEditing(true)} />;
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5">
      <h3 className="text-[13px] font-semibold uppercase tracking-wide text-text-muted mb-3">
        Services
      </h3>
      <div className="space-y-2">
        {SERVICE_TYPES.map((type) => {
          const entry = draft[type];
          const isExpanded = expanded === type;
          const isActive = !!entry;

          return (
            <div
              key={type}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isActive
                  ? entry.mode === "offering"
                    ? "border-green-200 bg-green-50/50"
                    : "border-blue-200 bg-blue-50/50"
                  : "border-border bg-bg-card"
              }`}
            >
              <button
                type="button"
                onClick={() => setExpanded(isExpanded ? null : type)}
                className="w-full flex items-center justify-between px-4 py-3.5 press"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[18px]">{SERVICE_ICONS[type]}</span>
                  <span className="text-[15px] font-semibold text-text">
                    {SERVICE_LABELS[type]}
                  </span>
                  {isActive && (
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        entry.mode === "offering"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {entry.mode === "offering" ? "Offering" : "Looking"}
                    </span>
                  )}
                </div>
                <ChevronDown
                  size={16}
                  strokeWidth={2}
                  className={`text-text-muted transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 animate-fade-in">
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => toggleService(type, "offering")}
                      className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold press transition-all ${
                        entry?.mode === "offering"
                          ? "bg-green-500 text-white shadow-sm"
                          : "bg-bg-input text-text-muted hover:bg-bg-card-hover"
                      }`}
                    >
                      Offering
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleService(type, "looking")}
                      className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold press transition-all ${
                        entry?.mode === "looking"
                          ? "bg-blue-500 text-white shadow-sm"
                          : "bg-bg-input text-text-muted hover:bg-bg-card-hover"
                      }`}
                    >
                      Looking
                    </button>
                  </div>
                  {entry && (
                    <>
                      <textarea
                        value={entry.details}
                        onChange={(e) => {
                          updateDetails(type, e.target.value);
                          e.target.style.height = "auto";
                          e.target.style.height = e.target.scrollHeight + "px";
                        }}
                        ref={(el) => {
                          if (el) {
                            el.style.height = "auto";
                            el.style.height = el.scrollHeight + "px";
                          }
                        }}
                        placeholder={
                          type === "other"
                            ? "What service? Add details..."
                            : "Add details (rates, availability, subjects...)"
                        }
                        maxLength={5000}
                        rows={2}
                        className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-[13px] placeholder:text-text-muted/40 outline-none focus:border-text-muted transition-colors resize-none leading-relaxed"
                      />
                      {entry.details.length > 4500 && (
                        <p className={`text-[11px] mt-1 ${entry.details.length > 5000 ? "text-red-500 font-semibold" : "text-text-muted"}`}>
                          {entry.details.length}/5000
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setDraft((prev) => {
                            const next = { ...prev };
                            delete next[type];
                            return next;
                          });
                        }}
                        className="mt-2 text-[12px] text-red-500 font-medium press"
                      >
                        Remove
                      </button>
                    </>
                  )}
                  {!entry && (
                    <p className="text-[12px] text-text-muted/50 text-center">
                      Tap Offering or Looking to get started
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 bg-[#1a1a1a] text-white px-5 py-2.5 rounded-full font-semibold text-[13px] press disabled:opacity-30"
        >
          <Check size={14} strokeWidth={2} />
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={handleCancel}
          className="flex items-center gap-1.5 text-[13px] text-text-muted px-3 py-2.5 press"
        >
          <X size={14} strokeWidth={2} />
          Cancel
        </button>
      </div>
    </div>
  );
}

function ServiceBadge({ type, entry, onEdit }: { type: ServiceType; entry: ServiceEntry | null; onEdit: () => void }) {
  if (!entry) {
    return (
      <button
        type="button"
        onClick={onEdit}
        className="w-full rounded-2xl px-4 py-3 flex items-center gap-3 bg-bg-input/30 border border-dashed border-border press"
      >
        <span className="text-[16px] opacity-40">{SERVICE_ICONS[type]}</span>
        <span className="text-[14px] font-medium text-text-muted/50">{SERVICE_LABELS[type]}</span>
      </button>
    );
  }

  const isOffering = entry.mode === "offering";
  return (
    <div
      className={`rounded-2xl px-4 py-3 flex items-start gap-3 ${
        isOffering
          ? "bg-green-50 border border-green-200"
          : "bg-blue-50 border border-blue-200"
      }`}
    >
      <span className="text-[16px] mt-0.5">{SERVICE_ICONS[type]}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold">{SERVICE_LABELS[type]}</span>
          <span
            className={`text-[11px] font-semibold uppercase tracking-wide ${
              isOffering ? "text-green-600" : "text-blue-600"
            }`}
          >
            · {isOffering ? "Offering" : "Looking"}
          </span>
        </div>
        {entry.details && (
          <p className="text-[13px] text-text-muted mt-0.5">{entry.details}</p>
        )}
      </div>
    </div>
  );
}
