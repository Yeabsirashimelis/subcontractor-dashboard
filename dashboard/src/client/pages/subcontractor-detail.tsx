import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Globe, Phone, Mail, MapPin, Building2 } from "lucide-react";
import { useSubcontractor } from "@/hooks/use-subcontractors";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
      {children}
    </span>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Globe;
  label: string;
  value: string | null | undefined;
  href?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm">{value}</p>
        )}
      </div>
    </div>
  );
}

export function SubcontractorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isPending } = useSubcontractor(Number(id));
  const sub = data?.data;

  if (isPending) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="h-6 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-6 space-y-4">
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <p className="mt-8 text-center text-muted-foreground">
          Subcontractor not found.
        </p>
      </div>
    );
  }

  const address = [sub.address, sub.city, sub.state, sub.zipCode]
    .filter(Boolean)
    .join(", ");

  const websiteUrl = sub.website?.startsWith("http")
    ? sub.website
    : sub.website
      ? `https://${sub.website}`
      : undefined;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="mt-6">
          <div className="flex items-start gap-4">
            {sub.logoUrl ? (
              <img
                src={sub.logoUrl}
                alt=""
                className="h-14 w-14 shrink-0 rounded-lg border object-contain"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border bg-muted">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{sub.name}</h1>
              {sub.companyType && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {sub.companyType}
                </p>
              )}
            </div>
          </div>

          {sub.description && (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {sub.description}
            </p>
          )}
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <section className="rounded-lg border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Contact</h2>
            <div className="divide-y">
              <InfoRow icon={MapPin} label="Address" value={address} />
              <InfoRow icon={Phone} label="Phone" value={sub.phone} />
              <InfoRow icon={Mail} label="Email" value={sub.email} />
              <InfoRow
                icon={Globe}
                label="Website"
                value={sub.website}
                href={websiteUrl}
              />
            </div>
          </section>

          <section className="rounded-lg border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Company Info</h2>
            <div className="space-y-3 text-sm">
              {sub.employeeCount && (
                <div>
                  <p className="text-xs text-muted-foreground">Employees</p>
                  <p>{sub.employeeCount}</p>
                </div>
              )}
              {sub.avgContractSize && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Avg. Contract Size
                  </p>
                  <p>{sub.avgContractSize}</p>
                </div>
              )}
              {(sub.totalProjects != null || sub.activeProjects != null) && (
                <div>
                  <p className="text-xs text-muted-foreground">Projects</p>
                  <p>
                    {sub.activeProjects ?? 0} active
                    {sub.totalProjects != null &&
                      ` / ${sub.totalProjects} total`}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {(sub.trades ?? []).length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-sm font-semibold">Trades</h2>
            <div className="flex flex-wrap gap-2">
              {sub.trades.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          </section>
        )}

        {(sub.marketSectors ?? []).length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold">Market Sectors</h2>
            <div className="flex flex-wrap gap-2">
              {sub.marketSectors.map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
            </div>
          </section>
        )}

        {(sub.businessClassifications ?? []).length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold">
              Business Classifications
            </h2>
            <div className="flex flex-wrap gap-2">
              {sub.businessClassifications.map((c) => (
                <Badge key={c}>{c}</Badge>
              ))}
            </div>
          </section>
        )}

        {(sub.serviceAreas ?? []).length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold">Service Areas</h2>
            <div className="flex flex-wrap gap-2">
              {sub.serviceAreas.map((a) => (
                <Badge key={a}>{a}</Badge>
              ))}
            </div>
          </section>
        )}

        {(sub.samUei || sub.federalAwardsTotal != null || sub.nycBidsCount != null) && (
          <section className="mt-8 rounded-lg border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">
              Government & Enrichment Data
            </h2>
            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              {sub.samUei && (
                <div>
                  <p className="text-xs text-muted-foreground">SAM.gov UEI</p>
                  <p className="font-mono">{sub.samUei}</p>
                  {sub.samStatus && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Status: {sub.samStatus}
                    </p>
                  )}
                </div>
              )}
              {sub.federalAwardsTotal != null && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Federal Awards
                  </p>
                  <p>${sub.federalAwardsTotal.toLocaleString()}</p>
                </div>
              )}
              {sub.nycBidsCount != null && (
                <div>
                  <p className="text-xs text-muted-foreground">NYC Bids</p>
                  <p>{sub.nycBidsCount}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
