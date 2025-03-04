"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Brain,
  Calendar,
  ChevronDown,
  Clock,
  Database,
  Eye,
  Filter,
  Globe,
  Info,
  Layers,
  Maximize2,
  Newspaper,
  Search,
  Shield,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Chart1, Chart2, Chart3, Chart4, Chart5 } from "@/components/mock-charts";
import { SkynetProvider, useSkynetData } from "@/context/skynet-context";
import { LocalizationProvider, useLocalization } from "@/context/localization-context";
import { LanguageSelector } from "@/components/language-selector";

// Icons mapping for dynamic rendering
const iconMap = {
  "alert-triangle": AlertTriangle,
  database: Database,
  shield: Shield,
  zap: Zap,
};

// Main dashboard component that uses the context
function DashboardContent() {
  const { data } = useSkynetData();
  const { t } = useLocalization();
  const [timeframe, setTimeframe] = useState("1Y");

  // Helper function to get the appropriate badge color class
  const getBadgeColorClass = (category: string) => {
    switch (category) {
      case "critical":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "warning":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "development":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "positive":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "";
    }
  };

  // Helper function to get timeline point color
  const getTimelinePointColor = (status: string) => {
    switch (status) {
      case "current":
        return "bg-green-500";
      case "warning":
        return "bg-amber-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  // Helper function to translate category
  const translateCategory = (category: string) => {
    switch (category) {
      case "critical":
        return t("news.categories.critical");
      case "warning":
        return t("news.categories.warning");
      case "development":
        return t("news.categories.development");
      case "positive":
        return t("news.categories.positive");
      default:
        return category;
    }
  };

  // Helper function to translate impact
  const translateImpact = (impact: string) => {
    switch (impact.toLowerCase()) {
      case "severe":
        return t("news.impacts.severe");
      case "moderate":
        return t("news.impacts.moderate");
      case "positive":
        return t("news.impacts.positive");
      default:
        return impact;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b px-4 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <Brain className="h-6 w-6 text-red-500" />
          <span className="hidden sm:inline-block">{t("common.dashboard")}</span>
          <span className="sm:hidden">SPM</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder={t("common.search")}
              className="rounded-md border bg-background pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 w-[240px]"
            />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("common.filter")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <LanguageSelector />
          <Badge variant="outline" className="border-red-800/50 bg-red-500/10 text-red-500 gap-1 hidden sm:flex">
            <Clock className="h-3 w-3" />
            {t("common.liveMonitoring")}
          </Badge>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{t("header.title")}</h1>
            <div className="flex items-center gap-2">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {t("common.lastUpdated")}: {data.lastUpdated}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Today</DropdownMenuItem>
                  <DropdownMenuItem>Yesterday</DropdownMenuItem>
                  <DropdownMenuItem>Last 7 days</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <p className="text-muted-foreground max-w-4xl">
            {t("header.subtitle")}
            <span className="text-red-500 font-semibold"> {t("common.disclaimer")}</span>
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {data.companies.map((company) => {
            const IconComponent = iconMap[company.statusIcon];
            return (
              <Card key={company.id}>
                <CardHeader className="pb-2">
                  <CardDescription>{company.name}</CardDescription>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{company.shortName}</CardTitle>
                    <div
                      className={`flex items-center gap-1 ${
                        company.trend.direction === "up" ? "text-red-500" : "text-green-500"
                      } text-sm font-medium`}
                    >
                      <ArrowUpRight className={`h-3 w-3 ${company.trend.direction === "down" ? "rotate-180" : ""}`} />
                      {company.trend.direction === "up" ? "+" : "-"}
                      {company.trend.value}%
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t("common.skynetProbability")}</span>
                      <span className="font-medium">{company.probability}%</span>
                    </div>
                    <Progress value={company.probability} className="h-2">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                        style={{ width: `${company.probability}%` }}
                      />
                    </Progress>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {IconComponent && <IconComponent className={`h-3 w-3 text-${company.statusColor}-500`} />}
                    <span>{company.statusMessage}</span>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="trends" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="trends">{t("tabs.trends")}</TabsTrigger>
              <TabsTrigger value="news">{t("tabs.news")}</TabsTrigger>
              <TabsTrigger value="analysis">{t("tabs.analysis")}</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className={timeframe === "1M" ? "bg-muted" : ""}
                onClick={() => setTimeframe("1M")}
              >
                {t("timeframes.oneMonth")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={timeframe === "6M" ? "bg-muted" : ""}
                onClick={() => setTimeframe("6M")}
              >
                {t("timeframes.sixMonths")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={timeframe === "1Y" ? "bg-muted" : ""}
                onClick={() => setTimeframe("1Y")}
              >
                {t("timeframes.oneYear")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={timeframe === "5Y" ? "bg-muted" : ""}
                onClick={() => setTimeframe("5Y")}
              >
                {t("timeframes.fiveYears")}
              </Button>
            </div>
          </div>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t("charts.computationalPower.title")}</CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{t("charts.computationalPower.tooltip")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <CardDescription>{t("charts.computationalPower.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Chart1 />
                </CardContent>
                <CardFooter className="flex justify-between text-sm text-muted-foreground">
                  {data.companies.map((company) => (
                    <div key={company.id} className="flex items-center gap-1">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          company.id === "neuralink"
                            ? "bg-blue-500"
                            : company.id === "nexus"
                            ? "bg-green-500"
                            : company.id === "cortex"
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <span>{company.shortName}</span>
                    </div>
                  ))}
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t("charts.neuralComplexity.title")}</CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{t("charts.neuralComplexity.tooltip")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <CardDescription>{t("charts.neuralComplexity.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Chart2 />
                </CardContent>
                <CardFooter className="flex justify-between text-sm text-muted-foreground">
                  {data.companies.map((company) => (
                    <div key={company.id} className="flex items-center gap-1">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          company.id === "neuralink"
                            ? "bg-blue-500"
                            : company.id === "nexus"
                            ? "bg-green-500"
                            : company.id === "cortex"
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <span>{company.shortName}</span>
                    </div>
                  ))}
                </CardFooter>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t("charts.selfModification.title")}</CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{t("charts.selfModification.tooltip")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <CardDescription>{t("charts.selfModification.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Chart3 />
                </CardContent>
                <CardFooter className="flex justify-between text-sm text-muted-foreground">
                  {data.companies.map((company) => (
                    <div key={company.id} className="flex items-center gap-1">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          company.id === "neuralink"
                            ? "bg-blue-500"
                            : company.id === "nexus"
                            ? "bg-green-500"
                            : company.id === "cortex"
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <span>{company.shortName}</span>
                    </div>
                  ))}
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t("charts.resourceAcquisition.title")}</CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{t("charts.resourceAcquisition.tooltip")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <CardDescription>{t("charts.resourceAcquisition.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Chart4 />
                </CardContent>
                <CardFooter className="flex justify-between text-sm text-muted-foreground">
                  {data.companies.map((company) => (
                    <div key={company.id} className="flex items-center gap-1">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          company.id === "neuralink"
                            ? "bg-blue-500"
                            : company.id === "nexus"
                            ? "bg-green-500"
                            : company.id === "cortex"
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <span>{company.shortName}</span>
                    </div>
                  ))}
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="news" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("news.title")}</CardTitle>
                <CardDescription>{t("news.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6">
                    {data.news.map((item) => (
                      <div
                        key={item.id}
                        className={`border-l-2 border-${
                          item.category === "critical"
                            ? "red"
                            : item.category === "warning"
                            ? "amber"
                            : item.category === "development"
                            ? "blue"
                            : "green"
                        }-500 pl-4`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={getBadgeColorClass(item.category)}>
                            {translateCategory(item.category)}
                          </Badge>
                          <span className="text-muted-foreground text-sm">{item.date}</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                        <p className="text-muted-foreground mb-2">{item.content}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="h-4 w-4" />
                          <span>
                            {t("common.globalImpact")}: {translateImpact(item.impact)}
                          </span>
                          <Separator orientation="vertical" className="h-4" />
                          <Eye className="h-4 w-4" />
                          <span>
                            {item.views.toLocaleString()} {t("common.views")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("analysis.riskFactors.title")}</CardTitle>
                  <CardDescription>{t("analysis.riskFactors.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Chart5 />
                </CardContent>
                <CardFooter className="flex flex-col gap-2 text-sm text-muted-foreground">
                  {data.riskFactors.map((factor) => (
                    <div key={factor.id} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1">
                        <div className={`h-2 w-2 rounded-full bg-${factor.color}-500`}></div>
                        <span>{factor.name}</span>
                      </div>
                      <span className="font-medium">
                        {factor.level.charAt(0).toUpperCase() + factor.level.slice(1)}
                      </span>
                    </div>
                  ))}
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("analysis.companyProfiles.title")}</CardTitle>
                  <CardDescription>{t("analysis.companyProfiles.description")}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    <div className="divide-y">
                      {data.companies.map((company) => (
                        <div key={company.id} className="p-4 hover:bg-muted/50">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">
                              {company.name} - {company.shortName}
                            </h3>
                            <Badge
                              className={`bg-${
                                company.probability > 80
                                  ? "red-600"
                                  : company.probability > 60
                                  ? "red-500"
                                  : company.probability > 40
                                  ? "amber-500"
                                  : "green-500"
                              }`}
                            >
                              {company.probability}%
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{company.details}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Layers className={`h-3 w-3 text-${company.statusColor}-500`} />
                            <span>
                              {t("common.criticalRiskFactors")}: {company.riskFactors}
                            </span>
                            <Separator orientation="vertical" className="h-3" />
                            <Newspaper className="h-3 w-3" />
                            <span>
                              {company.recentIncidents} {t("common.recentIncidents")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    {t("analysis.companyProfiles.viewFullAssessment")}
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t("analysis.timeline.title")}</CardTitle>
                <CardDescription>{t("analysis.timeline.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute top-0 bottom-0 left-[15%] w-0.5 bg-border"></div>

                  {data.timeline.map((event) => (
                    <div key={event.id} className="relative pl-8 pb-10">
                      <div
                        className={`absolute left-[15%] -translate-x-1/2 w-4 h-4 rounded-full ${getTimelinePointColor(
                          event.status
                        )} border-4 border-background`}
                      ></div>
                      <div className="mb-1 text-sm text-muted-foreground">{event.period}</div>
                      <h3 className="text-lg font-semibold mb-1">{event.title}</h3>
                      <p className="text-muted-foreground">{event.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground italic">{t("analysis.timeline.note")}</div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <footer className="border-t p-4 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-1">
          <Brain className="h-4 w-4 text-red-500" />
          <span>{t("footer.text")}</span>
        </div>
      </footer>
    </div>
  );
}

// Wrapper component that provides the context
export default function SkynetDashboard() {
  return (
    <LocalizationProvider>
      <SkynetProvider>
        <DashboardContent />
      </SkynetProvider>
    </LocalizationProvider>
  );
}
