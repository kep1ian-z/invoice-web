export function SiteFooter() {
    return (
        <footer className="border-t">
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-center px-4 text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} Invoice Web. All rights reserved.</p>
            </div>
        </footer>
    );
}
