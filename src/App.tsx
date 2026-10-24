import { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  useLocation,
} from "react-router-dom";
import {
  Users,
  Grid2X2,
  Star,
  MoreHorizontal,
  TrainFront,
  FileText,
  ChartNoAxesCombined,
  Info,
} from "lucide-react";
import { Home } from "@/pages/Home";
import { ThemeToggle } from "@/components/theme-toggle";
import { analyticsService } from "@/services/analytics.service";
const Categories = lazy(() =>
  import("@/pages/Categories").then((module) => ({
    default: module.Categories,
  })),
);
const Favorites = lazy(() =>
  import("@/pages/Favorites").then((module) => ({ default: module.Favorites })),
);
const Documents = lazy(() =>
  import("@/pages/Documents").then((module) => ({ default: module.Documents })),
);
const Analytics = lazy(() =>
  import("@/pages/Analytics").then((module) => ({ default: module.Analytics })),
);
const About = lazy(() =>
  import("@/pages/About").then((module) => ({ default: module.About })),
);
const BloodGroups = lazy(() =>
  import("@/pages/BloodGroups").then((module) => ({
    default: module.BloodGroups,
  })),
);
const More = lazy(() =>
  import("@/pages/More").then((module) => ({ default: module.More })),
);
const navigation = [
  { to: "/", label: "Contacts", icon: Users },
  { to: "/categories", label: "Categories", icon: Grid2X2 },
  { to: "/favorites", label: "Favorites", icon: Star },
  { to: "/more", label: "More", icon: MoreHorizontal },
];
const secondary = [
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/analytics", label: "Analytics", icon: ChartNoAxesCombined },
  { to: "/about", label: "About", icon: Info },
];
let tracked = false;
function Shell() {
  const location = useLocation();
  const [savedRoutes, setSavedRoutes] = useState<Record<string, string>>({});
  const remember = () => {
    if (location.pathname === "/" || location.pathname === "/categories")
      setSavedRoutes((previous) => ({
        ...previous,
        [location.pathname]: location.search,
      }));
  };
  const destination = (path: string) =>
    path +
    (path === location.pathname ? location.search : savedRoutes[path] || "");
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);
  useEffect(() => {
    if (!tracked) {
      tracked = true;
      void analyticsService.incrementVisitCount().catch(() => {
        /* Analytics never blocks the directory. */
      });
    }
  }, []);
  return (
    <div className="min-h-dvh">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:p-3 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r bg-card px-4 py-6 md:flex">
        <Link to="/" className="mb-10 flex items-center gap-3 px-2">
          <span className="rounded-xl bg-primary p-2.5 text-primary-foreground">
            <TrainFront className="size-6" />
          </span>
          <span className="font-semibold tracking-tight">
            WAT Contacts
            <span className="block text-xs font-normal text-muted-foreground">
              Waltair Division
            </span>
          </span>
        </Link>
        <nav aria-label="Main navigation" className="space-y-1">
          {[...navigation.slice(0, 3), ...secondary].map(
            ({ to, label, icon: Icon }) => (
              <NavLink
                end={to === "/"}
                key={to}
                to={destination(to)}
                onClick={remember}
                className={({ isActive }) =>
                  `flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm ${isActive ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-muted"}`
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            ),
          )}
        </nav>
        <div className="mt-auto border-t pt-4">
          <Link
            to="/more"
            className="flex min-h-11 items-center gap-3 px-3 text-sm text-muted-foreground"
          >
            <MoreHorizontal className="size-4" />
            App settings
          </Link>
          <p className="px-3 pt-4 text-xs leading-relaxed text-muted-foreground">
            Developed by
            <br />
            Nagendra Yakkaladevara
          </p>
        </div>
      </aside>
      <div className="md:ml-60">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-7">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold md:hidden"
          >
            <TrainFront className="size-5 text-primary" />
            WAT Contacts
          </Link>
          <p className="hidden text-sm text-muted-foreground md:block">
            Your railway directory
          </p>
          <ThemeToggle />
        </header>
        <main
          id="main-content"
          className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-7 sm:pt-8 md:pb-10"
        >
          <Suspense
            fallback={
              <p
                role="status"
                className="py-12 text-center text-muted-foreground"
              >
                Loading page…
              </p>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/about" element={<About />} />
              <Route path="/blood-groups" element={<BloodGroups />} />
              <Route path="/more" element={<More />} />
              <Route
                path="*"
                element={
                  <div className="space-y-3">
                    <h1 className="text-2xl font-semibold">Page not found</h1>
                    <Link className="text-primary" to="/">
                      Return to contacts
                    </Link>
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </main>
      </div>
      <nav
        aria-label="Mobile navigation"
        className="mobile-nav fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t bg-card/95 backdrop-blur md:hidden"
      >
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink
            end={to === "/"}
            key={to}
            to={destination(to)}
            onClick={remember}
            className={({ isActive }) =>
              `flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium ${isActive || (to === "/more" && secondary.some((item) => item.to === location.pathname)) ? "text-primary" : "text-muted-foreground"}`
            }
          >
            <Icon className="size-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
