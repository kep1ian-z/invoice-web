export default function NotFound() {
    return (
        <div className="mx-auto max-w-5xl px-4 py-12 text-center">
            <h1 className="text-2xl font-semibold">견적서를 찾을 수 없습니다</h1>
            <p className="mt-2 text-muted-foreground">
                링크가 존재하지 않거나 만료되었습니다.
            </p>
        </div>
    );
}
