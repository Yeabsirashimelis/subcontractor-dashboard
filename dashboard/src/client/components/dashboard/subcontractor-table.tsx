import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon, MapPin, Phone, Globe } from "lucide-react";
import type { Subcontractor, PaginatedResponse } from "@shared/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface Props {
  data: PaginatedResponse<Subcontractor> | undefined;
  isPending: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 5 }).map((_, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function MobileSkeletonCards() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MobileCard({ sub }: { sub: Subcontractor }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/subcontractors/${sub.id}`)}
      className="cursor-pointer rounded-lg border bg-card p-4 transition-colors active:bg-accent/50 hover:bg-accent/50"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium leading-tight">{sub.name}</h3>
          {sub.companyType && (
            <p className="mt-0.5 text-xs text-muted-foreground">{sub.companyType}</p>
          )}
        </div>
        <ChevronRightIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      </div>

      {sub.description && (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {sub.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {(sub.city || sub.state) && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {sub.city}{sub.state ? `, ${sub.state}` : ""}
          </span>
        )}
        {sub.phone && (
          <span className="inline-flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {sub.phone}
          </span>
        )}
        {sub.website && (
          <a
            href={sub.website.startsWith("http") ? sub.website : `https://${sub.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <Globe className="h-3 w-3" />
            Website
          </a>
        )}
      </div>

      {(sub.trades ?? []).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {sub.trades.slice(0, 3).map((t) => (
            <Badge key={t} variant="secondary" className="text-[11px] font-normal">
              {t}
            </Badge>
          ))}
          {sub.trades.length > 3 && (
            <span className="self-center text-xs text-muted-foreground">
              +{sub.trades.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function Pagination({
  page,
  meta,
  onPageChange,
}: {
  page: number;
  meta: { total: number; totalPages: number; limit: number };
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 border-t px-4 py-3 sm:flex-row sm:justify-between">
      <p className="text-xs text-muted-foreground sm:text-sm">
        {(page - 1) * meta.limit + 1}
        {"–"}
        {Math.min(page * meta.limit, meta.total)} of {meta.total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[4rem] text-center text-sm">
          {page} / {meta.totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={page >= meta.totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function SubcontractorTable({
  data,
  isPending,
  page,
  onPageChange,
}: Props) {
  const navigate = useNavigate();
  const rows = data?.data ?? [];
  const meta = data?.meta;

  return (
    <>
      {/* Mobile card list */}
      <div className="sm:hidden">
        {isPending && !rows.length ? (
          <MobileSkeletonCards />
        ) : rows.length === 0 ? (
          <div className="rounded-lg border py-12 text-center text-sm text-muted-foreground">
            No subcontractors found. Try adjusting your filters.
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((sub) => (
              <MobileCard key={sub.id} sub={sub} />
            ))}
          </div>
        )}
        {meta && meta.totalPages > 1 && (
          <div className="mt-3">
            <Card>
              <Pagination page={page} meta={meta} onPageChange={onPageChange} />
            </Card>
          </div>
        )}
      </div>

      {/* Desktop table */}
      <Card className="hidden sm:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Trades</TableHead>
                <TableHead>Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending && !rows.length ? (
                <SkeletonRows />
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    No subcontractors found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((sub) => (
                  <TableRow
                    key={sub.id}
                    onClick={() => navigate(`/subcontractors/${sub.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <div className="font-medium">{sub.name}</div>
                      {sub.description && (
                        <div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                          {sub.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {sub.city}
                      {sub.state ? `, ${sub.state}` : ""}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {sub.companyType ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(sub.trades ?? []).slice(0, 2).map((t) => (
                          <Badge key={t} variant="secondary" className="text-xs font-normal">
                            {t}
                          </Badge>
                        ))}
                        {(sub.trades ?? []).length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{sub.trades.length - 2}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {sub.phone && (
                        <div className="text-xs">{sub.phone}</div>
                      )}
                      {sub.website && (
                        <a
                          href={
                            sub.website.startsWith("http")
                              ? sub.website
                              : `https://${sub.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Website
                        </a>
                      )}
                      {!sub.phone && !sub.website && (
                        <span className="text-xs text-muted-foreground">{"—"}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {meta && meta.totalPages > 1 && (
          <Pagination page={page} meta={meta} onPageChange={onPageChange} />
        )}
      </Card>
    </>
  );
}
