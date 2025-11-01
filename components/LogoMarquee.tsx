"use client";
import Image from "next/image";
import React from "react";

type Item = { name: string; src?: string };

const ITEMS: Item[] = [
  // Calendars & Suites
  { name: "Google Calendar" },
  { name: "Microsoft 365 / Outlook" },
  { name: "iCloud (CalDAV)" },

  // Telephony & Voice
  { name: "Twilio" },
  { name: "Retell.ai" },
  { name: "Telnyx" },
  { name: "Vonage" },
  { name: "Plivo" },

  // CRM & Inbox
  { name: "HubSpot" },
  { name: "Salesforce" },
  { name: "Zoho" },
  { name: "Pipedrive" },

  // Payments & POS
  { name: "Stripe" },
  { name: "Square" },
  { name: "Clover" },
  { name: "Lightspeed" },

  // Salons & Spas
  { name: "Vagaro" },
  { name: "Fresha" },
  { name: "Boulevard" },
  { name: "Mangomint" },
  { name: "Booksy" },
  { name: "Squire" },

  // Restaurants & Hospitality
  { name: "OpenTable" },
  { name: "Resy" },
  { name: "Toast" },
  { name: "SevenRooms" },

  // Medical (EHR/EMR)
  { name: "Epic" },
  { name: "Oracle Health (Cerner)" },
  { name: "athenahealth" },
  { name: "NextGen" },
  { name: "eClinicalWorks" },
  { name: "DrChrono" },
  { name: "Tebra/Kareo" },
  { name: "AdvancedMD" },
  { name: "ModMed" },
  { name: "SimplePractice" },
  { name: "Dentrix" },
  { name: "Nextech" },

  // Property Mgmt
  { name: "Yardi" },
  { name: "RealPage" },
  { name: "AppFolio" },
  { name: "Entrata" },
  { name: "BuildingLink" },
  { name: "MRI Software" },

  // Field Service
  { name: "ServiceTitan" },
  { name: "Jobber" },
  { name: "Housecall Pro" },
  { name: "ServiceM8" },
  { name: "FieldEdge" },

  // Dry Cleaning
  { name: "CleanCloud" },
  { name: "SMRT Systems" },

  // Vet & Pet Care
  { name: "ezyVet" },
  { name: "Covetrus Pulse" },
  { name: "Vetstoria" },

  // Messaging / Automation
  { name: "Slack" },
  { name: "Zendesk" },
  { name: "Freshdesk" },
  { name: "Zapier" },
  { name: "Make" },
  { name: "n8n" },
];

export default function LogoMarquee() {
  const loops = React.useMemo(() => {
    const midpoint = Math.ceil(ITEMS.length / 2);
    const firstRow = ITEMS.slice(0, midpoint);
    const secondRow = ITEMS.slice(midpoint);

    return [firstRow, secondRow]
      .filter((row) => row.length > 0)
      .map((row) => [...row, ...row]);
  }, []);

  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h3 className="text-center text-xl sm:text-2xl font-semibold">
        Integrates with your stack
      </h3>
      <p className="mt-2 text-center text-sm text-gray-600">
        Calendars, telephony, CRMs, EHRs, POS, property & field service tools, and more.
      </p>

      <div className="mt-6 relative overflow-hidden">
        {/* Edge fade masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent dark:from-neutral-900"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent dark:from-neutral-900"></div>

        <div className="space-y-6">
          {loops.map((loop, rowIndex) => (
            <div
              key={`logo-marquee-row-${rowIndex}`}
              className={`flex w-max items-center gap-10 motion-reduce:animate-none will-change-transform ${
                rowIndex === 0 ? "animate-marquee-slow" : "animate-marquee-slow-reverse"
              }`}
            >
              {loop.map((item, i) => (
                <div key={`${item.name}-${i}`} className="shrink-0 flex items-center gap-3">
                  {item.src ? (
                    <Image
                      src={item.src}
                      alt={item.name}
                      width={120}
                      height={40}
                      className="h-6 w-auto opacity-80 hover:opacity-100 transition"
                      priority={i < 8}
                    />
                  ) : (
                    <span className="text-xs rounded-full border px-3 py-1 text-gray-700 dark:text-gray-200">
                      {item.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } /* list duplicated */
        }
        .animate-marquee-slow {
          animation: marquee 70s linear infinite;
        }
        .animate-marquee-slow:hover,
        .animate-marquee-slow-reverse:hover {
          animation-play-state: paused; /* pause on hover */
        }
        .animate-marquee-slow-reverse {
          animation: marquee 70s linear infinite reverse;
        }
      `}</style>
    </section>
  );
}
