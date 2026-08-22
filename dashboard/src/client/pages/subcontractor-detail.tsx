import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Globe, Phone, Mail, MapPin, Building2 } from "lucide-react";
import { useSubcontractor } from "@/hooks/use-subcontractors";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="mx-auto max-w-3xl px-3 py-6 sm:px-4 sm:py-8">
        <Skeleton className="h-6 w-24" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-8 w-48 sm:w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="mx-auto max-w-3xl px-3 py-6 sm:px-4 sm:py-8">
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
      <div className="mx-auto max-w-3xl px-3 py-6 sm:px-4 sm:py-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="mt-4 sm:mt-6">
          <div className="flex items-start gap-3 sm:gap-4">
            {sub.logoUrl ? (
              <img
                src={sub.logoUrl}
                alt=""
                className="h-12 w-12 shrink-0 rounded-lg border object-contain sm:h-14 sm:w-14"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-muted sm:h-14 sm:w-14">
                <Building2 className="h-5 w-5 text-muted-foreground sm:h-6 sm:w-6" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                {sub.name}
              </h1>
              {sub.companyType && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {sub.companyType}
                </p>
              )}
            </div>
          </div>

          {sub.description && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:mt-4">
              {sub.description}
            </p>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Contact</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              <InfoRow icon={MapPin} label="Address" value={address} />
              <InfoRow icon={Phone} label="Phone" value={sub.phone} />
              <InfoRow icon={Mail} label="Email" value={sub.email} />
              <InfoRow
                icon={Globe}
                label="Website"
                value={sub.website}
                href={websiteUrl}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Company Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
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
            </CardContent>
          </Card>
        </div>

        {(sub.trades ?? []).length > 0 && (
          <section className="mt-6 sm:mt-8">
            <h2 className="mb-3 text-sm font-semibold">Trades</h2>
            <div className="flex flex-wrap gap-2">
              {sub.trades.map((t) => (
                <Badge key={t} variant="secondary">{t}</Badge>
              ))}
            </div>
          </section>
        )}

        {(sub.marketSectors ?? []).length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold">Market Sectors</h2>
            <div className="flex flex-wrap gap-2">
              {sub.marketSectors.map((s) => (
                <Badge key={s} variant="secondary">{s}</Badge>
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
                <Badge key={c} variant="outline">{c}</Badge>
              ))}
            </div>
          </section>
        )}

        {(sub.serviceAreas ?? []).length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold">Service Areas</h2>
            <div className="flex flex-wrap gap-2">
              {sub.serviceAreas.map((a) => (
                <Badge key={a} variant="outline">{a}</Badge>
              ))}
            </div>
          </section>
        )}

        {(sub.samUei || sub.federalAwardsTotal != null || sub.nycBidsCount != null) && (
          <Card className="mt-6 sm:mt-8">
            <CardHeader>
              <CardTitle className="text-sm">
                Government & Enrichment Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 text-sm sm:grid-cols-3">
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
