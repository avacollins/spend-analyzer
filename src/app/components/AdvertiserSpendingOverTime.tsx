/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* cSpell:disable */
"use client";

import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import React, { useMemo, useState } from "react";

import { ResponsiveBump } from "@nivo/bump";
import type { RootState } from "../store/store";
import { useSelector } from "react-redux";

interface AdvertiserSpendingOverTimeProps {
  height?: number;
}

interface BumpChartData {
  id: string;
  data: Array<{
    x: string;
    y: number;
  }>;
}

export default function AdvertiserSpendingOverTime({
  height = 500,
}: AdvertiserSpendingOverTimeProps) {
  const deduplicatedData = useSelector(
    (state: RootState) => state.data.cleanData
  );

  const [selectedAdvertiser, setSelectedAdvertiser] =
    useState<string>("All Advertisers");
  const [timeField, setTimeField] = useState<"spend_week" | "spend_month">(
    "spend_month"
  );
  const [groupBy, setGroupBy] = useState<"topic" | "election" | "total">(
    "topic"
  );

  // Get unique advertisers with "All Advertisers" option
  const getAdvertisers = (): string[] => {
    const advertisers = deduplicatedData
      .map((item) => item.advertiser)
      .filter((value): value is string => !!value)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return ["All Advertisers", ...advertisers];
  };

  // Process data for bump chart
  const bumpChartData = useMemo(() => {
    if (deduplicatedData.length === 0) return [];

    // Filter data based on advertiser selection
    const filteredData =
      selectedAdvertiser === "All Advertisers"
        ? deduplicatedData.filter((item) => item[timeField] && item.spend)
        : deduplicatedData.filter(
            (item) =>
              item.advertiser === selectedAdvertiser &&
              item[timeField] &&
              item.spend
          );

    if (filteredData.length === 0) return [];

    // Group by time period and category
    const timeGroupedData = new Map<string, Map<string, number>>();

    filteredData.forEach((item) => {
      const timeValue = item[timeField]!;
      let categoryValue: string;

      // Determine category based on groupBy and advertiser selection
      if (selectedAdvertiser === "All Advertisers") {
        if (groupBy === "total") {
          categoryValue = "Total Market Spending";
        } else {
          categoryValue = item[groupBy] || "Unknown";
        }
      } else {
        if (groupBy === "total") {
          categoryValue = `${selectedAdvertiser} Total`;
        } else {
          categoryValue = item[groupBy] || "Unknown";
        }
      }

      const spendValue = parseFloat(item.spend || "0");
      if (isNaN(spendValue) || spendValue <= 0) return;

      if (!timeGroupedData.has(timeValue)) {
        timeGroupedData.set(timeValue, new Map());
      }

      const currentSpend =
        timeGroupedData.get(timeValue)!.get(categoryValue) || 0;
      timeGroupedData
        .get(timeValue)!
        .set(categoryValue, currentSpend + spendValue);
    });

    // Sort time periods
    const sortedTimePeriods = Array.from(timeGroupedData.keys()).sort();
    if (sortedTimePeriods.length < 2) return [];

    // Calculate rankings for each time period
    const rankingsOverTime = new Map<
      string,
      Array<{ category: string; spend: number; rank: number }>
    >();

    sortedTimePeriods.forEach((timePeriod) => {
      const spendingData = Array.from(
        timeGroupedData.get(timePeriod)!.entries()
      )
        .map(([category, spend]) => ({ category, spend }))
        .sort((a, b) => b.spend - a.spend)
        .map((item, index) => ({ ...item, rank: index + 1 }));

      rankingsOverTime.set(timePeriod, spendingData);
    });

    // Get all categories
    const allCategories = new Set<string>();
    rankingsOverTime.forEach((rankings) => {
      rankings.forEach((item) => allCategories.add(item.category));
    });

    // Convert to bump chart format
    const bumpData: BumpChartData[] = Array.from(allCategories).map(
      (category) => {
        const data = sortedTimePeriods.map((timePeriod) => {
          const rankings = rankingsOverTime.get(timePeriod) || [];
          const categoryRanking = rankings.find((r) => r.category === category);

          return {
            x: timePeriod,
            y: categoryRanking ? categoryRanking.rank : rankings.length + 1,
          };
        });

        return {
          id: category,
          data,
        };
      }
    );

    // Limit results and sort by data quality
    const limit = selectedAdvertiser === "All Advertisers" ? 10 : 8;
    return bumpData
      .map((entity) => ({
        ...entity,
        validPoints: entity.data.filter(
          (point) => point.y <= allCategories.size
        ).length,
        avgRank:
          entity.data.reduce((sum, point) => sum + point.y, 0) /
          entity.data.length,
      }))
      .sort((a, b) => {
        if (b.validPoints !== a.validPoints)
          return b.validPoints - a.validPoints;
        return a.avgRank - b.avgRank;
      })
      .slice(0, limit)
      .map(({ avgRank, ...entity }) => entity);
  }, [deduplicatedData, selectedAdvertiser, timeField, groupBy]);

  // Calculate total spending
  const totalSpending = useMemo(() => {
    if (selectedAdvertiser === "All Advertisers") {
      return deduplicatedData.reduce((sum, item) => {
        const spend = parseFloat(item.spend || "0");
        return sum + (isNaN(spend) ? 0 : spend);
      }, 0);
    }

    return deduplicatedData
      .filter((item) => item.advertiser === selectedAdvertiser)
      .reduce((sum, item) => {
        const spend = parseFloat(item.spend || "0");
        return sum + (isNaN(spend) ? 0 : spend);
      }, 0);
  }, [deduplicatedData, selectedAdvertiser]);

  // Get spending summary
  const getSpendingSummary = () => {
    const summary = new Map<string, number>();

    const dataToProcess =
      selectedAdvertiser === "All Advertisers"
        ? deduplicatedData.filter((item) => item[timeField])
        : deduplicatedData.filter(
            (item) => item.advertiser === selectedAdvertiser && item[timeField]
          );

    dataToProcess.forEach((item) => {
      const timeValue = item[timeField]!;
      const spend = parseFloat(item.spend || "0");
      if (!isNaN(spend)) {
        summary.set(timeValue, (summary.get(timeValue) || 0) + spend);
      }
    });

    return Array.from(summary.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);
  };

  // Get advertiser count
  const getAdvertiserCount = () => {
    if (selectedAdvertiser !== "All Advertisers") return 0;
    const uniqueAdvertisers = new Set(
      deduplicatedData
        .map((item) => item.advertiser)
        .filter((value): value is string => !!value)
    );
    return uniqueAdvertisers.size;
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Generate description
  const getChartDescription = (): string => {
    if (selectedAdvertiser === "All Advertisers") {
      if (groupBy === "topic") {
        return `Showing how topics rank by total spending across all advertisers by ${timeField.replace(
          "spend_",
          ""
        )}.`;
      } else if (groupBy === "election") {
        return `Showing how elections rank by total spending across all advertisers by ${timeField.replace(
          "spend_",
          ""
        )}.`;
      } else {
        return `Showing total market spending trend by ${timeField.replace(
          "spend_",
          ""
        )}.`;
      }
    } else {
      return `Showing ${selectedAdvertiser}'s ${groupBy} rankings by ${timeField.replace(
        "spend_",
        ""
      )}.`;
    }
  };

  if (deduplicatedData.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          No data available. Please upload a CSV file to analyze advertiser
          spending over time.
        </Typography>
      </Box>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Advertiser Spending Over Time
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          How has{" "}
          {selectedAdvertiser === "All Advertisers"
            ? "all advertisers"
            : selectedAdvertiser}{" "}
          spent over time?
          <br />
          {getChartDescription()}
        </Typography>

        {/* Controls */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* @ts-expect-error MUI Grid typing issue with xs and md props */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Select Advertiser</InputLabel>
              <Select
                value={selectedAdvertiser}
                label="Select Advertiser"
                onChange={(e: SelectChangeEvent) =>
                  setSelectedAdvertiser(e.target.value)
                }
              >
                {getAdvertisers().map((advertiser) => (
                  <MenuItem key={advertiser} value={advertiser}>
                    {advertiser}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* @ts-expect-error MUI Grid typing issue with xs and md props */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Time Period</InputLabel>
              <Select
                value={timeField}
                label="Time Period"
                onChange={(e: SelectChangeEvent) =>
                  setTimeField(e.target.value as "spend_week" | "spend_month")
                }
              >
                <MenuItem value="spend_month">By Month</MenuItem>
                <MenuItem value="spend_week">By Week</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {/* @ts-expect-error MUI Grid typing issue with xs and md props */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Group By</InputLabel>
              <Select
                value={groupBy}
                label="Group By"
                onChange={(e: SelectChangeEvent) =>
                  setGroupBy(e.target.value as "topic" | "election" | "total")
                }
              >
                <MenuItem value="topic">Topic</MenuItem>
                <MenuItem value="election">Election</MenuItem>
                <MenuItem value="total">Total Spending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Info Chips */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label={`Analyzing: ${selectedAdvertiser}`}
            color="primary"
            variant="outlined"
            sx={{ mr: 1 }}
          />
          <Chip
            label={`Total Spending: ${formatCurrency(totalSpending)}`}
            variant="outlined"
          />
          {selectedAdvertiser === "All Advertisers" && (
            <Chip
              label={`${getAdvertiserCount()} Advertisers`}
              variant="outlined"
              sx={{ ml: 1 }}
            />
          )}
        </Box>

        {/* Chart Display */}
        <Box sx={{ height, backgroundColor: "#fafafa", borderRadius: 1, p: 1 }}>
          {bumpChartData.length > 0 ? (
            <ResponsiveBump
              data={bumpChartData}
              colors={{ scheme: "category10" }}
              lineWidth={3}
              activeLineWidth={6}
              inactiveLineWidth={3}
              inactiveOpacity={0.15}
              pointSize={10}
              activePointSize={16}
              inactivePointSize={0}
              pointColor={{ theme: "background" }}
              pointBorderWidth={3}
              activePointBorderWidth={3}
              pointBorderColor={{ from: "serie.color" }}
              axisTop={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: "",
                legendPosition: "middle",
                legendOffset: -36,
              }}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: timeField === "spend_month" ? "Month" : "Week",
                legendPosition: "middle",
                legendOffset: 50,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: `${
                  groupBy === "total"
                    ? "Spending"
                    : groupBy.charAt(0).toUpperCase() + groupBy.slice(1)
                } Ranking`,
                legendPosition: "middle",
                legendOffset: -40,
              }}
              margin={{ top: 40, right: 120, bottom: 70, left: 60 }}
              // @ts-expect-error Nivo ResponsiveBump tooltip prop typing issues
              // Note: 'serie' is the correct parameter name used by Nivo library
              tooltip={({ serie, point }: any) => (
                <div
                  style={{
                    background: "white",
                    padding: "12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <strong>
                    {selectedAdvertiser === "All Advertisers"
                      ? `${
                          groupBy === "total"
                            ? "Market"
                            : groupBy.charAt(0).toUpperCase() + groupBy.slice(1)
                        }: ${serie.id}`
                      : `${selectedAdvertiser} - ${serie.id}`}
                  </strong>
                  <br />
                  {timeField === "spend_month" ? "Month" : "Week"}:{" "}
                  {point.data.x}
                  <br />
                  Rank: #{point.data.y}
                  <br />
                  <em>Lower rank = higher spending</em>
                </div>
              )}
              legends={[
                {
                  anchor: "right",
                  direction: "column",
                  justify: false,
                  translateX: 100,
                  translateY: 0,
                  itemsSpacing: 2,
                  itemDirection: "left-to-right",
                  itemWidth: 80,
                  itemHeight: 12,
                  itemOpacity: 0.75,
                  symbolSize: 12,
                  symbolShape: "circle",
                  symbolBorderColor: "rgba(0, 0, 0, .5)",
                  effects: [
                    {
                      on: "hover",
                      style: {
                        itemBackground: "rgba(0, 0, 0, .03)",
                        itemOpacity: 1,
                      },
                    },
                  ],
                },
              ]}
            />
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Typography variant="body1" color="text.secondary">
                Not enough time periods to show ranking changes. Try selecting a
                different time period or grouping.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Spending Summary */}
        {getSpendingSummary().length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Spending Summary
              {selectedAdvertiser !== "All Advertisers" &&
                ` for ${selectedAdvertiser}`}
            </Typography>
            <Grid container spacing={2}>
              {getSpendingSummary().map(([period, amount]) => (
                // @ts-expect-error MUI Grid typing issue with xs and md props
                <Grid item xs={6} md={2} key={period}>
                  <Box
                    sx={{
                      textAlign: "center",
                      p: 1,
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {period}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(amount)}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Explanation */}
        <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>How to read this chart:</strong> This bump chart shows how{" "}
            {selectedAdvertiser === "All Advertisers"
              ? `${groupBy} rankings change over time across all advertisers`
              : `${selectedAdvertiser}'s ${groupBy} rankings change over time`}
            . Each line represents a different category, and the Y-axis shows
            the ranking (1 = highest spending, 2 = second highest, etc.). Lines
            moving up indicate decreasing spending priority, while lines moving
            down show increasing priority.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
