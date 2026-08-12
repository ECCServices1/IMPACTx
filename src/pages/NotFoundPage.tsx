import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center">
      <div className="panel p-12">
        <h1 className="font-serif text-[30px] font-medium tracking-[-0.02em]">Nothing here</h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">
          That link may be out of date. The decks are all still where you left them.
        </p>
        <Link to="/" className="btn btn-md btn-primary mt-6">Back to the decks</Link>
      </div>
    </div>
  );
}
