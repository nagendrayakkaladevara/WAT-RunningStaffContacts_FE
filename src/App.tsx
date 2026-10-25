import { MotionConfig, LazyMotion, domMax, m } from "motion/react";
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
  Menu,
  TrainFront,
  FileText,
  ChartNoAxesCombined,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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
  const isHome = location.pathname === "/";
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
      <header
        className={`sticky top-0 z-30 bg-background ${isHome ? "" : "border-b"}`}
      >
        <div className="mx-auto flex h-18 max-w-[1120px] items-center justify-between gap-4 px-6">
          <Link
            to="/"
            onClick={remember}
            className="flex min-h-11 items-center gap-3"
          >
            <TrainFront
              aria-hidden="true"
              className="size-6"
              strokeWidth={1.5}
            />
            <span className="text-[15px] font-medium tracking-tight">
              WAT Contacts
              <span className="block text-xs font-normal tracking-normal text-muted-foreground">
                Waltair Division
              </span>
            </span>
          </Link>
          <nav
            aria-label="Main navigation"
            className={isHome ? "hidden" : "hidden items-center gap-1 md:flex"}
          >
            {navigation.map(({ to, label }) => (
              <NavLink
                key={to}
                end={to === "/"}
                to={destination(to)}
                onClick={remember}
                className={({ isActive }) =>
                  `relative flex min-h-11 items-center px-5 text-sm transition-colors ${isActive || (to === "/more" && secondary.some((item) => item.to === location.pathname)) ? "font-medium text-foreground after:absolute after:inset-x-5 after:bottom-0 after:h-px after:bg-foreground" : "text-muted-foreground hover:text-foreground"}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <div className={isHome ? "" : "md:hidden"}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open navigation"
                    className="rounded-full"
                  >
                    <Menu
                      aria-hidden="true"
                      className="size-5"
                      strokeWidth={1.5}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  {[...navigation, ...secondary].map(
                    ({ to, label, icon: Icon }) => (
                      <DropdownMenuItem
                        asChild
                        key={to}
                        className="min-h-11 rounded-lg"
                      >
                        <Link
                          to={destination(to)}
                          onClick={remember}
                          aria-current={
                            location.pathname === to ? "page" : undefined
                          }
                        >
                          <Icon aria-hidden="true" />
                          {label}
                        </Link>
                      </DropdownMenuItem>
                    ),
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      <div>
        <main
          id="main-content"
          className={`mx-auto max-w-[1120px] px-6 ${isHome ? "" : "pb-28 pt-6 sm:pt-12 md:pb-16"}`}
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
            <m.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.18 }}
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
            </m.div>
          </Suspense>
        </main>
        {!isHome && (
          <footer className="mx-auto hidden max-w-[1120px] items-center justify-between gap-4 border-t px-6 py-8 text-xs text-muted-foreground md:flex">
            <span>East Coast Railway · Waltair Division</span>
            <Link to="/about" className="py-3 hover:text-foreground">
              Made by Nagendra Yakkaladevara
            </Link>
          </footer>
        )}
      </div>
      {!isHome && (
        <nav
          aria-label="Mobile navigation"
          className="mobile-nav fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t bg-background md:hidden"
        >
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              end={to === "/"}
              key={to}
              to={destination(to)}
              onClick={remember}
              className={({ isActive }) =>
                `flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium ${isActive || (to === "/more" && secondary.some((item) => item.to === location.pathname)) ? "text-foreground underline decoration-1 underline-offset-4" : "text-muted-foreground"}`
              }
            >
              <Icon aria-hidden="true" className="size-5" strokeWidth={1.5} />
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domMax}>
        <BrowserRouter>
          <Shell />
        </BrowserRouter>
      </LazyMotion>
    </MotionConfig>
  );
}
