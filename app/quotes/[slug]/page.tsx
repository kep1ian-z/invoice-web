import type { Quote } from "@/lib/types/quote";

export default async function Page(props: PageProps<"/quotes/[slug]">) {
    const { slug } = await props.params;

    // 실제 Notion 조회는 이후 Phase에서 구현 (지금은 slug만 표시하는 빈 껍데기)
    const quoteSlug: Quote["slug"] = slug;

    return (
        <div className="mx-auto max-w-5xl px-4 py-12">
            <h1 className="text-2xl font-semibold">견적서 상세</h1>
            <p className="mt-2 text-muted-foreground">
                요청한 견적서 slug: <span className="font-mono">{quoteSlug}</span>
            </p>
        </div>
    );
}
