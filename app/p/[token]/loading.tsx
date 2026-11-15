export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-cream/20 border-t-gold" />
    </div>
  );
}
