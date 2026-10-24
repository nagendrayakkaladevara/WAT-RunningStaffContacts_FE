import * as React from "react";
import {
  Contact,
  Eye,
  HeartPulse,
  Building2,
  Briefcase,
  TrendingUp,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { analyticsService } from "@/services/analytics.service";
import type {
  AnalyticsOverview,
  BloodGroupDistribution,
  LobbyDistribution,
  DesignationDistribution,
  GrowthData,
  RecentContacts,
  VisitHistory,
} from "@/types/analytics";
import { VisitsHistoryChart } from "@/components/analytics/visits-history-chart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatPhoneNumber } from "@/lib/phone-formatter";

export function Analytics() {
  const [overview, setOverview] = React.useState<AnalyticsOverview | null>(
    null,
  );
  const [bloodGroupDist, setBloodGroupDist] =
    React.useState<BloodGroupDistribution | null>(null);
  const [lobbyDist, setLobbyDist] = React.useState<LobbyDistribution | null>(
    null,
  );
  const [designationDist, setDesignationDist] =
    React.useState<DesignationDistribution | null>(null);
  const [growthData, setGrowthData] = React.useState<GrowthData | null>(null);
  const [recentContacts, setRecentContacts] =
    React.useState<RecentContacts | null>(null);
  // Test data for visits history chart (commented out - testing completed)
  /*
  const testVisitsHistory: VisitHistory = {
    period: "7 days",
    totalVisits: 1000,
    data: [
      { date: "2025-12-23", count: 5 },
      { date: "2025-12-24", count: 8 },
      { date: "2025-12-25", count: 12 },
      { date: "2025-12-26", count: 10 },
      { date: "2025-12-27", count: 15 },
      { date: "2025-12-28", count: 20 },
      { date: "2025-12-29", count: 18 },
    ],
  }
  */

  const [visitsHistory, setVisitsHistory] = React.useState<VisitHistory | null>(
    null,
  );
  const [loading, setLoading] = React.useState(true);
  const [visitsLoading, setVisitsLoading] = React.useState(false);
  const [growthLoading, setGrowthLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [growthDays, setGrowthDays] = React.useState(7);
  const [visitsDays, setVisitsDays] = React.useState(7);

  const initialPeriods = React.useRef({ growthDays, visitsDays });

  // Initial overview; subsequent period changes refresh only the selected chart.
  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          overviewData,
          bgData,
          lobbyData,
          desData,
          growth,
          recent,
          visits,
        ] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getBloodGroupDistribution(),
          analyticsService.getLobbyDistribution(),
          analyticsService.getDesignationDistribution(),
          analyticsService.getGrowth(initialPeriods.current.growthDays),
          analyticsService.getRecentContacts(10),
          analyticsService.getVisitsHistory(initialPeriods.current.visitsDays),
        ]);

        setOverview(overviewData);
        setBloodGroupDist(bgData);
        setLobbyDist(lobbyData);
        setDesignationDist(desData);
        setGrowthData(growth);
        setRecentContacts(recent);
        setVisitsHistory(visits);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch analytics",
        );
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Separate effect for growth data when growthDays changes (after initial load)
  const isInitialMountGrowth = React.useRef(true);
  React.useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        setGrowthLoading(true);
        const growth = await analyticsService.getGrowth(growthDays);
        setGrowthData(growth);
      } catch (err) {
        console.error("Error fetching growth data:", err);
      } finally {
        setGrowthLoading(false);
      }
    };

    // Skip on initial mount (growth data is already fetched in initial load)
    if (isInitialMountGrowth.current) {
      isInitialMountGrowth.current = false;
      return;
    }

    fetchGrowthData();
  }, [growthDays]);

  // Separate effect for visits history when visitsDays changes (after initial load)
  const isInitialMountVisits = React.useRef(true);
  React.useEffect(() => {
    const fetchVisitsHistory = async () => {
      try {
        setVisitsLoading(true);
        const visits = await analyticsService.getVisitsHistory(visitsDays);
        setVisitsHistory(visits);
      } catch (err) {
        console.error("Error fetching visits history:", err);
      } finally {
        setVisitsLoading(false);
      }
    };

    // Skip on initial mount (visits history is already fetched in initial load)
    if (isInitialMountVisits.current) {
      isInitialMountVisits.current = false;
      return;
    }

    fetchVisitsHistory();
  }, [visitsDays]);

  const handleGrowthDaysChange = (days: number) => {
    setGrowthDays(days);
    // Loading state is handled by the useEffect
  };

  const handleVisitsDaysChange = (days: number) => {
    setVisitsDays(days);
    // Loading state is handled by the useEffect
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h1 className="page-heading">Analytics</h1>
          <p className="text-muted-foreground">
            View statistics and insights about your contacts.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h1 className="page-heading">Analytics</h1>
          <p className="text-muted-foreground">
            View statistics and insights about your contacts.
          </p>
        </div>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <p className="text-sm font-medium text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="page-heading">Directory insights</h1>
        <p className="text-muted-foreground">
          A closer look at the directory and how it is used.
        </p>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Contacts"
            value={overview.totalContacts}
            icon={Contact}
          />
          <StatCard
            title="Total Visits"
            value={overview.visitCount}
            icon={Eye}
          />
          <StatCard
            title="Contacts added in past 7 Days"
            value={overview.recentContacts7Days}
            icon={Calendar}
          />
          <StatCard
            title="Contacts added in past 30 Days"
            value={overview.recentContacts30Days}
            icon={TrendingUp}
          />
        </div>
      )}

      {/* Coverage Metrics */}
      {overview && (
        <div className="grid gap-4 md:grid-cols-2">
          <CoverageCard
            title="Blood Group Coverage"
            covered={overview.contactsWithBloodGroup}
            total={overview.totalContacts}
            percentage={parseFloat(overview.bloodGroupCoverage)}
            missing={overview.contactsWithoutBloodGroup}
            icon={HeartPulse}
          />
          <CoverageCard
            title="Lobby Coverage"
            covered={overview.contactsWithLobby}
            total={overview.totalContacts}
            percentage={parseFloat(overview.lobbyCoverage)}
            missing={overview.contactsWithoutLobby}
            icon={Briefcase}
          />
        </div>
      )}

      {/* Distribution Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {bloodGroupDist && (
          <DistributionChart
            title="Blood Group Distribution"
            data={bloodGroupDist.distribution}
            total={bloodGroupDist.total}
            getLabel={(item) => item.bloodGroup || ""}
            icon={HeartPulse}
          />
        )}

        {lobbyDist && (
          <DistributionChart
            title="Lobby Distribution"
            data={lobbyDist.distribution}
            total={lobbyDist.total}
            getLabel={(item) => item.lobby || ""}
            icon={Briefcase}
          />
        )}
      </div>

      {/* Designation Distribution - Full Width */}
      {designationDist && (
        <DistributionChart
          title="Designation Distribution"
          data={designationDist.distribution}
          total={designationDist.total}
          getLabel={(item) => item.designation || ""}
          icon={Building2}
        />
      )}

      {/* Visits History Chart */}
      <VisitsHistoryChart
        data={visitsHistory}
        days={visitsDays}
        loading={visitsLoading}
        onDaysChange={handleVisitsDaysChange}
      />

      {/* Growth Chart and Recent Contacts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GrowthChart
          data={growthData}
          days={growthDays}
          loading={growthLoading}
          onDaysChange={handleGrowthDaysChange}
        />

        {recentContacts && <RecentContactsCard data={recentContacts} />}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}

function StatCard({ title, value, icon: Icon }: StatCardProps) {
  return (
    <Card className="gap-0 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-medium tabular-nums">
            {value.toLocaleString()}
          </p>
        </div>
        <div className="rounded-full bg-muted p-3 text-muted-foreground">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}

interface CoverageCardProps {
  title: string;
  covered: number;
  total: number;
  percentage: number;
  missing: number;
  icon: React.ComponentType<{ className?: string }>;
}

function CoverageCard({
  title,
  covered,
  percentage,
  missing,
  icon: Icon,
}: CoverageCardProps) {
  return (
    <Card className="gap-0 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-muted p-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {percentage.toFixed(2)}% coverage
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-muted-foreground">With data</span>
          </div>
          <span className="font-medium">{covered}</span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-[width] duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Missing data</span>
          </div>
          <span className="font-medium text-muted-foreground">{missing}</span>
        </div>
      </div>
    </Card>
  );
}

interface DistributionChartProps {
  title: string;
  data: Array<{
    count: number;
    percentage: string;
    bloodGroup?: string;
    lobby?: string;
    designation?: string;
  }>;
  total: number;
  getLabel: (item: {
    count: number;
    percentage: string;
    bloodGroup?: string;
    lobby?: string;
    designation?: string;
  }) => string;
  icon: React.ComponentType<{ className?: string }>;
}

function DistributionChart({
  title,
  data,
  total,
  getLabel,
  icon: Icon,
}: DistributionChartProps) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  return (
    <Card className="gap-0 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-muted p-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">Total: {total}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => {
          const label = getLabel(item);
          const percentage = parseFloat(item.percentage);
          const width = (item.count / maxCount) * 100;

          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{item.count}</span>
                  <span className="font-semibold">
                    {percentage.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-[width] duration-300"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

interface GrowthChartProps {
  data: GrowthData | null;
  days: number;
  loading?: boolean;
  onDaysChange: (days: number) => void;
}

function GrowthChart({
  data,
  days,
  loading = false,
  onDaysChange,
}: GrowthChartProps) {
  const maxCumulative = data
    ? Math.max(...data.dailyGrowth.map((d) => d.cumulative), 1)
    : 1;
  const maxDaily = data
    ? Math.max(...data.dailyGrowth.map((d) => d.count), 1)
    : 1;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Card className="gap-0 p-6">
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-muted p-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Contacts Growth</h3>
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : data?.period || ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          {[7, 30, 90, 365].map((d) => (
            <Button
              variant="ghost"
              aria-pressed={days === d}
              key={d}
              onClick={() => onDaysChange(d)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                days === d
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {d}d
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Total Added</span>
          <span className="text-sm font-semibold">
            {loading ? "..." : data?.totalAdded.toLocaleString() || "0"}
          </span>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex h-[200px] items-center justify-center">
          <div className="text-sm text-muted-foreground">
            Loading chart data...
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {data?.dailyGrowth.slice(-14).map((day, index) => {
            const cumulativeWidth = (day.cumulative / maxCumulative) * 100;
            const dailyWidth = maxDaily > 0 ? (day.count / maxDaily) * 100 : 0;

            return (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {formatDate(day.date)}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">+{day.count}</span>
                    <span className="font-medium">{day.cumulative}</span>
                  </div>
                </div>
                <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="absolute left-0 top-0 h-full bg-primary/30 transition-all duration-300"
                    style={{ width: `${cumulativeWidth}%` }}
                  />
                  <div
                    className="absolute left-0 top-0 h-full bg-primary transition-all duration-300"
                    style={{ width: `${dailyWidth}%` }}
                  />
                </div>
              </div>
            );
          }) || []}
        </div>
      )}
    </Card>
  );
}

interface RecentContactsCardProps {
  data: RecentContacts;
}

function RecentContactsCard({ data }: RecentContactsCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Card className="gap-0 p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-full bg-muted p-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-semibold">Recent Contacts</h3>
          <p className="text-sm text-muted-foreground">
            Last {data.count} added contacts
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {data.contacts.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No recent contacts found
          </p>
        ) : (
          data.contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-start justify-between rounded-lg border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{contact.name}</span>
                  {contact.bloodGroup && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/30 dark:text-red-400">
                      {contact.bloodGroup}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {contact.phone && (
                    <span className="flex items-center gap-1">
                      {formatPhoneNumber(contact.phone)}
                    </span>
                  )}
                  {contact.lobby && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {contact.lobby}
                    </span>
                  )}
                  {contact.designation && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {contact.designation}
                    </span>
                  )}
                </div>
              </div>
              <div className="ml-4 text-xs text-muted-foreground">
                {formatDate(contact.createdAt)}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
