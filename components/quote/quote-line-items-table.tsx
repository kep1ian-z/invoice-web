import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatWon } from "@/lib/format";
import type { QuoteLineItem } from "@/lib/types/quote";

interface QuoteLineItemsTableProps {
    lineItems: QuoteLineItem[];
}

// 견적 항목 목록. 데스크톱(md 이상)은 표, 모바일은 카드형 스택으로 표시한다.
export function QuoteLineItemsTable({ lineItems }: QuoteLineItemsTableProps) {
    if (lineItems.length === 0) {
        return (
            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                등록된 견적 항목이 없습니다.
            </p>
        );
    }

    return (
        <>
            {/* 데스크톱: 표 */}
            <div className="hidden md:block">
                <Table>
                    <TableCaption className="sr-only">견적 항목 목록</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>항목</TableHead>
                            <TableHead className="text-right">단가</TableHead>
                            <TableHead className="text-right">수량</TableHead>
                            <TableHead className="text-right">금액</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {lineItems.map((item) => (
                            <TableRow key={item.itemName}>
                                <TableCell className="font-medium whitespace-normal">
                                    {item.itemName}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {formatWon(item.unitPrice)}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {item.quantity}
                                </TableCell>
                                <TableCell className="text-right font-medium tabular-nums">
                                    {formatWon(item.subtotal)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* 모바일: 카드형 스택 */}
            <ul className="space-y-3 md:hidden" aria-label="견적 항목 목록">
                {lineItems.map((item) => (
                    <li key={item.itemName}>
                        <Card size="sm">
                            <CardContent className="space-y-3">
                                <p className="font-medium">{item.itemName}</p>
                                <Separator />
                                <dl className="space-y-1 text-sm">
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-muted-foreground">단가</dt>
                                        <dd className="tabular-nums">{formatWon(item.unitPrice)}</dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-muted-foreground">수량</dt>
                                        <dd className="tabular-nums">{item.quantity}</dd>
                                    </div>
                                    <div className="flex justify-between gap-4 font-medium">
                                        <dt className="text-muted-foreground">금액</dt>
                                        <dd className="tabular-nums">{formatWon(item.subtotal)}</dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>
                    </li>
                ))}
            </ul>
        </>
    );
}
