import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** A new page should start at the top, which client-side routing does not do. */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
