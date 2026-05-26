import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import FeatureModules from "./pages/FeatureModules";
import H5Experience from "./pages/H5Experience";
import InteractivePage from "./pages/InteractivePage";
import { routePath } from "./lib/sitePaths";

const welcomeRoutePaths = Array.from(
  new Set(
    [
      routePath("/"),
      routePath("/").replace(/\/$/, ""),
      routePath("/index.html"),
      "/",
      "/index.html",
    ].filter((path) => path.length > 0),
  ),
);

function Router() {
  return (
    <Switch>
      {welcomeRoutePaths.map((path) => (
        <Route key={path} path={path} component={Landing} />
      ))}
      <Route path={routePath("/map")} component={Home} />
      <Route path={routePath("/modules")} component={FeatureModules} />
      <Route path={routePath("/h5")} component={H5Experience} />
      <Route path={routePath("/interactive")} component={InteractivePage} />
      <Route path={routePath("/404")} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable={true}
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
