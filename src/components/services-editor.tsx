"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Services, ServiceType, ServiceMode } from "@/types";
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
  const [services, setServices] = useState<Services>(initialServices);
  const [saving, setSaving] = useState<ServiceType | null>(null);
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

  const saveServices = async (updated: Services) => {
    const supabase = createClient();
    const cleaned: Services = {};
    for (const [key, val] of Object.entries(updated)) {
      if (val) cleaned[key as ServiceType] = val;
    }
    await supabase
      .from("profiles")
      .update({ services: Object.keys(cleaned).length > 0 ? cleaned : null })
      .eq("id", userId);
    router.refresh();
  };

  const handleToggleMode = async (type: ServiceType, mode: ServiceMode) => {
    const current = services[type];
    if (current?.mode === mode) {
      // Tapping the same mode again removes it
      const updated = { ...services };
      delete updated[type];
      setServices(updated);
      setSaving(type);
      await saveServices(updated);
      setSaving(null);
      return;
    }
    const updated = {
      ...services,
      [type]: { mode, details: current?.details || "" },
    };
    setServices(updated);
    setSaving(type);
    await saveServices(updated);
    setSaving(null);
  };

  const handleDetailsBlur = async (type: ServiceType, details: string) => {
    const current = services[type];
    if (!current || current.details === details) return;
    const updated = {
      ...services,
      [type]: { ...current, details },
    };
    setServices(updated);
    await saveServices(updated);
  };

  return (
    <div className="mb-5">
      <h3 className="text-[13px] font-semibold uppercase tracking-wide text-text-muted mb-2">
        Services
      </h3>
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
          const entry = services[type];
          return (
            <div
              key={type}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                entry
                  ? entry.mode === "offering"
                    ? "border-green-200 bg-green-50/50"
                    : "border-blue-200 bg-blue-50/50"
                  : "border-border bg-bg-card"
              }`}
            >
              <div className="px-4 py-3">
                <div className="flex items-center gap-3 mb-2.5">
                  <span className="text-[18px]">{SERVICE_ICONS[type]}</span>
                  <span className="text-[15px] font-semibold text-text">
                    {SERVICE_LABELS[type]}
                  </span>
                  {saving === type && (
                    <span className="text-[11px] text-text-muted">Saving...</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleMode(type, "offering")}
                    className={`flex-1 py-2 rounded-xl text-[13px] font-semibold press transition-all ${
                      entry?.mode === "offering"
                        ? "bg-green-500 text-white shadow-sm"
                        : "bg-bg-input text-text-muted hover:bg-bg-card-hover"
                    }`}
                  >
                    Offering
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleMode(type, "looking")}
                    className={`flex-1 py-2 rounded-xl text-[13px] font-semibold press transition-all ${
                      entry?.mode === "looking"
                        ? "bg-blue-500 text-white shadow-sm"
                        : "bg-bg-input text-text-muted hover:bg-bg-card-hover"
                    }`}
                  >
                    Looking
                  </button>
                </div>
                {entry && (
                  <textarea
                    defaultValue={entry.details}
                    onBlur={(e) => handleDetailsBlur(type, e.target.value)}
                    placeholder={
                      type === "other"
                        ? "What service? Add details..."
                        : "Add details (rates, availability...)"
                    }
                    maxLength={5000}
                    rows={1}
                    className="w-full mt-2.5 bg-white border border-border rounded-xl px-3.5 py-2.5 text-[13px] placeholder:text-text-muted/40 outline-none focus:border-text-muted transition-colors resize-none leading-relaxed"
                    ref={(el) => {
                      if (el) {
                        el.style.height = "auto";
                        el.style.height = el.scrollHeight + "px";
                      }
                    }}
                    onChange={(e) => {
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
