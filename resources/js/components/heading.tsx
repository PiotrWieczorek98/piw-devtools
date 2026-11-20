export default function Heading({
    title,
    description,
}: {
    title: string;
    description?: string;
}) {
    return (
        <header className="mb-6 space-y-1">
            <h2 className="text-lg font-medium">{title}</h2>
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
        </header>
    );
}
