import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Subcontractor, PaginatedResponse } from "@shared/types";

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
        <tr key={i} className="border-b">
          {Array.from({ length: 5 }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function SubcontractorTable({
  data,
  isPending,
  page,
  onPageChange,
}: Props) {
  const rows = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">City</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Trades</th>
              <th className="px-4 py-3 text-left font-medium">Contact</th>
            </tr>
          </thead>
          <tbody>
            {isPending && !rows.length ? (
              <SkeletonRows />
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  No subcontractors found. Try adjusting your filters.
                </td>
              </tr>
            ) : (
              rows.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{sub.name}</div>
                    {sub.description && (
                      <div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                        {sub.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {sub.city}
                    {sub.state ? `, ${sub.state}` : ""}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {sub.companyType ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(sub.trades ?? []).slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                        >
                          {t}
                        </span>
                      ))}
                      {(sub.trades ?? []).length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{sub.trades.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
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
                      >
                        Website
                      </a>
                    )}
                    {!sub.phone && !sub.website && (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * meta.limit + 1}–
            {Math.min(page * meta.limit, meta.total)} of {meta.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm hover:bg-muted disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm">
              {page} / {meta.totalPages}
            </span>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => onPageChange(page + 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm hover:bg-muted disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
