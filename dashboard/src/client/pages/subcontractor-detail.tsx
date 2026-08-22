import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Globe,
  Phone,
  Mail,
  MapPin,
  Building2,
  ExternalLink,
  Users,
  Briefcase,
  FolderOpen,
} from "lucide-react";
import { useSubcontractor } from "@/hooks/use-subcontractors";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";

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
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline break-all"
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
      <div className="mx-auto max-w-4xl px-3 py-6 sm:px-4 sm:py-8">
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
      <div className="mx-auto max-w-4xl px-3 py-6 sm:px-4 sm:py-8">
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

  const hasCompanyInfo =
    sub.employeeCount || sub.avgContractSize ||
    sub.totalProjects != null || sub.activeProjects != null;

  const hasEnrichment =
    sub.samUei || sub.federalAwardsTotal != null || sub.govtContractsCount != null;

  const hasContact = address || sub.phone || sub.email || sub.website;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-3 py-6 sm:px-4 sm:py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <ThemeToggle />
        </div>

        {/* Hero Header */}
        <Card className="mt-4 sm:mt-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-4">
              {sub.logoUrl ? (
                <img
                  src={sub.logoUrl}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-xl border object-contain sm:h-20 sm:w-20"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border bg-muted sm:h-20 sm:w-20">
                  <Building2 className="h-7 w-7 text-muted-foreground sm:h-8 sm:w-8" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                  {sub.name}
                </h1>
                {sub.companyType && (
                  <Badge variant="secondary" className="mt-1.5">
                    {sub.companyType}
                  </Badge>
                )}
                {sub.description && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {sub.description}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {sub.sourceUrl && (
                    <a
                      href={sub.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      View on Procore
                    </a>
                  )}
                  {websiteUrl && (
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      <Globe className="mr-1.5 h-3.5 w-3.5" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Company Info */}
        <div className={`mt-4 grid gap-4 sm:mt-6 ${hasCompanyInfo ? "sm:grid-cols-2" : ""}`}>
          {hasContact && (
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
          )}

          {hasCompanyInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Company Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {sub.employeeCount && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Employees</p>
                      <p>{sub.employeeCount}</p>
                    </div>
                  </div>
                )}
                {sub.avgContractSize && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Avg. Contract Size
                      </p>
                      <p>{sub.avgContractSize}</p>
                    </div>
                  </div>
                )}
                {(sub.totalProjects != null || sub.activeProjects != null) && (
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Projects</p>
                      <p>
                        {sub.activeProjects ?? 0} active
                        {sub.totalProjects != null &&
                          ` / ${sub.totalProjects} total`}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Trades */}
        {(sub.trades ?? []).length > 0 && (
          <Card className="mt-4 sm:mt-6">
            <CardHeader>
              <CardTitle className="text-sm">
                Trades
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({sub.trades.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {sub.trades.map((t: string) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Market Sectors & Service Areas side by side */}
        {((sub.marketSectors ?? []).length > 0 ||
          (sub.serviceAreas ?? []).length > 0) && (
          <div className="mt-4 grid gap-4 sm:mt-6 sm:grid-cols-2">
            {(sub.marketSectors ?? []).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Market Sectors
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      ({sub.marketSectors.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {sub.marketSectors.map((s: string) => (
                      <Badge key={s} variant="secondary">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {(sub.serviceAreas ?? []).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Service Areas
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      ({sub.serviceAreas.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {sub.serviceAreas.map((a: string) => (
                      <Badge key={a} variant="outline">
                        <MapPin className="mr-1 h-3 w-3" />
                        {a}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Business Classifications */}
        {(sub.businessClassifications ?? []).length > 0 && (
          <Card className="mt-4 sm:mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Business Classifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {sub.businessClassifications.map((c: string) => (
                  <Badge key={c} variant="outline">
                    {c}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Government & Enrichment Data */}
        {hasEnrichment && (
          <Card className="mt-4 sm:mt-6">
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
                {sub.govtContractsCount != null && sub.govtContractsCount > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground">Govt Contracts</p>
                    <p>{sub.govtContractsCount}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata footer */}
        {(sub.scrapedAt || sub.enrichedAt) && (
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground sm:mt-6">
            {sub.scrapedAt && (
              <span>Scraped: {new Date(sub.scrapedAt).toLocaleDateString()}</span>
            )}
            {sub.enrichedAt && (
              <span>Enriched: {new Date(sub.enrichedAt).toLocaleDateString()}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
