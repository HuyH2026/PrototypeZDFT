interface PlaceholderScreenProps {
  title: string;
  description?: string;
}

export function PlaceholderScreen({ title, description }: PlaceholderScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div className="w-12 h-12 rounded-full bg-[#293239]/10 flex items-center justify-center">
        <div className="w-5 h-5 rounded-full bg-[#293239]/20" />
      </div>
      <h2 className="text-[#293239] tracking-[-0.3px]">{title}</h2>
      {description && (
        <p className="text-[#646864] text-[13px] tracking-[-0.1px]">{description}</p>
      )}
    </div>
  );
}
