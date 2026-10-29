"use client";

import React, { useState } from "react";
import Badge from "@/components/ui/badge/Badge";
import { CheckIcon, PlusIcon } from "@/components/icons";
import { Calendar, MapPin } from "lucide-react";
import { useAuth } from "@/features/auth";
import { useRouter } from "next/navigation";

interface EventItem {
  id: string;
  title: string;
  organizer: string;
  dateStr: string;
  timeStr: string;
  location: string;
  category: string;
  description: string;
  attendeesCount: number;
}

export default function EventsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [events] = useState<EventItem[]>([]);
  const [participatingIds, setParticipatingIds] = useState<string[]>([]);

  const toggleParticipate = (id: string) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent("/events")}`);
      return;
    }
    setParticipatingIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
            Agenda Citoyen &amp; Événements Locaux
          </h1>
          <Badge variant="light" color="primary" size="sm">
            Proximité Bénin
          </Badge>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Participez aux activités citoyennes, réunions de résidents et actions solidaires dans votre localité.
        </p>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {events.length > 0 ? (
          events.map((ev) => {
            const isAttending = participatingIds.includes(ev.id);

            return (
              <div
                key={ev.id}
                className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center"
              >
                <div className="space-y-1.5 sm:max-w-xl">
                  <div className="flex items-center gap-2">
                    <Badge variant="light" color="info" size="sm">
                      {ev.category}
                    </Badge>
                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                      {ev.dateStr} • {ev.timeStr}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    {ev.title}
                  </h3>

                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {ev.description}
                  </p>

                  <p className="text-[11px] text-gray-500 flex items-center gap-1">
                    <MapPin className="size-3.5 text-brand-600 shrink-0" />
                    <span>{ev.location} • Organisé par <span className="font-semibold text-gray-700 dark:text-gray-300">{ev.organizer}</span></span>
                  </p>
                </div>

                <div className="mt-4 flex flex-col items-start gap-2 border-t border-gray-100 pt-3 dark:border-gray-800 sm:mt-0 sm:items-end sm:border-0 sm:pt-0">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    {ev.attendeesCount + (isAttending ? 1 : 0)} participants
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleParticipate(ev.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                      isAttending
                        ? "border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-brand-600 text-white hover:bg-brand-700 shadow-xs"
                    }`}
                  >
                    {isAttending ? (
                      <>
                        <CheckIcon className="size-3.5" />
                        <span>Inscrit</span>
                      </>
                    ) : (
                      <>
                        <PlusIcon className="size-3.5" />
                        <span>Je participe</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-12 text-center dark:border-gray-800 dark:bg-gray-900">
            <Calendar className="size-10 text-gray-300 dark:text-gray-600" />
            <h3 className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">
              Aucun événement programmé
            </h3>
            <p className="mt-1 text-xs text-gray-500 max-w-sm">
              Aucun événement citoyen ou associatif n&apos;est actuellement planifié dans vos communautés.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
