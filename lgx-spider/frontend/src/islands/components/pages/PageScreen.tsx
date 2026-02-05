interface PageScreenProps {
  name: string;
}

export function PageScreen({ name }: PageScreenProps) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-slate-900">{name}</h1>
    </div>
  );
}
