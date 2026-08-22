import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    <Card>
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

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * meta.limit + 1}
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
            <span className="text-sm">
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
      )}
    </Card>
  );
}
