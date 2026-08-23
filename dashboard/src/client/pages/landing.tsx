import { Link } from "react-router-dom";
import {
  Search,
  ShieldCheck,
  BarChart3,
  FileText,
  ArrowRight,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePublicStats } from "@/hooks/use-public-stats";

const VALUE_PROPS = [
  {
    icon: Search,
    title: "Search & Filter",
    description:
      "Find subcontractors by trade, city, or company type across California.",
  },
  {
    icon: ShieldCheck,
    title: "Government Data",
    description:
      "Profiles enriched with SAM.gov registration status, federal award history from USAspending, and SF Open Data contracts.",
  },
  {
    icon: BarChart3,
    title: "Interactive Analytics",
    description:
      "Toggle between chart views — company type distribution, trade × city explorer, and enrichment coverage breakdowns.",
  },
  {
    icon: FileText,
    title: "Detailed Profiles",
    description:
      "Drill into any subcontractor for the full picture: trades, contact info, Procore activity, and linked government records.",
  },
];

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="28" height="28" rx="7" className="fill-primary" />
            <path
              d="M8 19V9L14 13L20 9V19"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-primary-foreground fill-none"
            />
          </svg>
          <span className="hidden text-lg font-semibold tracking-tight sm:inline">
            Subtrak
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Link
            to="/login"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className={buttonVariants({ size: "sm" })}
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
      <Badge variant="secondary" className="mb-4">
        California
      </Badge>
      <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
        California&apos;s Subcontractor Intelligence Platform
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
        Browse verified subcontractor profiles, filter by trade and city, and
        access enriched data pulled straight from government sources.
      </p>
      <div className="mt-8 flex justify-center">
        <Link to="/register" className={buttonVariants({ size: "lg" })}>
          Get started — it&apos;s free
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function ValueProps() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {VALUE_PROPS.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <CardHeader>
              <Icon className="h-8 w-8 text-primary" />
              <CardTitle className="pt-2">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}

function StatsRow() {
  const { data, isLoading } = usePublicStats();

  const stats = [
    { label: "Subcontractors", value: data?.totalSubcontractors },
    { label: "Cities covered", value: data?.uniqueCities },
    { label: "Trades tracked", value: data?.uniqueTrades },
  ];

  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((stat) => (
          <div key={stat.label} className="px-4 py-10 text-center">
            {isLoading ? (
              <Skeleton className="mx-auto h-10 w-24" />
            ) : (
              <div className="text-4xl font-bold tracking-tight">
                {stat.value?.toLocaleString() ?? "—"}
              </div>
            )}
            <div className="mt-2 text-sm text-muted-foreground">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        <span className="font-semibold text-foreground">Subtrak</span>
        <span>Built with Hono, React &amp; Drizzle</span>
        <span>&copy; {new Date().getFullYear()} Subtrak</span>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <ValueProps />
      <StatsRow />
      <Footer />
    </div>
  );
}
