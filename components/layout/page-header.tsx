type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="px-4 pt-6 sm:px-6">
      <h1 className="text-xl font-semibold text-[var(--color-text)]">{title}</h1>
      {subtitle && (
        <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">{subtitle}</p>
      )}
    </div>
  );
}
