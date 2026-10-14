interface Props {
  label: string;
  subtitle?: string;
}

export default function PlaceholderTab({ label, subtitle }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-[#909297]">
      <p className="text-[14px]">{label} — coming soon</p>
      {subtitle && <p className="text-[12px] mt-1 text-[#c4cad4]">{subtitle}</p>}
      <p className="text-[12px] mt-1">This page is a placeholder in this prototype.</p>
    </div>
  );
}
