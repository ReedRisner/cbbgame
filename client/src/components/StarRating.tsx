export default function StarRating({ stars }: { stars: number }) {
  return <span className="text-yellow-400">{'★'.repeat(stars)}<span className="text-slate-500">{'★'.repeat(5 - stars)}</span></span>;
}
