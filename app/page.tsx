import { Badge } from "@/components/ui/badge";

export default function Home() {
    return (
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-24 text-center">
            <Badge>Invoice Web</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                견적서 웹 뷰어
            </h1>
            <p className="max-w-xl text-balance text-muted-foreground">
                Notion에 입력한 견적서를 클라이언트가 로그인 없이 웹에서
                열람하고 PDF로 다운로드할 수 있는 전용 페이지를 제공합니다.
                견적서 상세 페이지는 발급된 링크(slug)로 접근합니다.
            </p>
        </div>
    );
}
