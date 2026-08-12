import { BrowserRouter, Route, Routes } from "react-router-dom";
import Shell from "@/components/Shell";
import HomePage from "@/pages/HomePage";
import DeckPage from "@/pages/DeckPage";
import GroupSetupPage from "@/pages/GroupSetupPage";
import GroupPlayPage from "@/pages/GroupPlayPage";
import SavedPage from "@/pages/SavedPage";
import StudioPage from "@/pages/StudioPage";
import NotFoundPage from "@/pages/NotFoundPage";
import { ScrollToTop } from "@/components/ScrollToTop";

/** The base path the site is served from, injected at build time. */
const basename = typeof __BASE_PATH__ === "string" ? __BASE_PATH__ : "/";

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <ScrollToTop />
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/deck/:slug" element={<DeckPage />} />
          <Route path="/group" element={<GroupSetupPage />} />
          <Route path="/group/play" element={<GroupPlayPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/studio" element={<StudioPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
