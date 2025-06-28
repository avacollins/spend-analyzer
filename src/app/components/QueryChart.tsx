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

import { AdSpendingData } from "../store/dataSlice";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import type { RootState } from "../store/store";
import { useSelector } from "react-redux";

type QueryField =
  | "advertiser"
  | "election"
  | "topic"
  | "spend_week"
  | "spend_month";
type ChartType = "bar" | "pie";

interface QueryChartProps {
  height?: number;
}

interface AggregatedData {
  id: string;
  label: string;
  value: number;
  count: number;
  fields: Record<string, string>;
}

export default function QueryChart({ height = 400 }: QueryChartProps) {
  const deduplicatedData = useSelector(
    (state: RootState) => state.data.cleanData
  );

  // Query configuration state
  const [primaryField, setPrimaryField] = useState<QueryField>("advertiser");
  const [secondaryField, setSecondaryField] = useState<QueryField>("topic");
  const [chartType, setChartType] = useState<ChartType>("pie");

  // Filter state for specific values
  const [advertiserFilter, setAdvertiserFilter] = useState<string>("All");
  const [electionFilter, setElectionFilter] = useState<string>("All");
  const [topicFilter, setTopicFilter] = useState<string>("All");

  // Get unique values for each field
  const getUniqueValues = (field: QueryField): string[] => {
    const values = deduplicatedData
      .map((item) => item[field])
      .filter((value): value is string => !!value)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return ["All", ...values];
  };

  // Process data based on query configuration
  const processedData = useMemo(() => {
    if (deduplicatedData.length === 0) return [];

    // Apply filters
    const filteredData = deduplicatedData.filter((item) => {
      if (
        advertiserFilter &&
        advertiserFilter !== "All" &&
        item.advertiser !== advertiserFilter
      )
        return false;
      if (
        electionFilter &&
        electionFilter !== "All" &&
        item.election !== electionFilter
      )
        return false;
      if (topicFilter && topicFilter !== "All" && item.topic !== topicFilter)
        return false;
      return true;
    });

    // Group by primary field
    const groupedData = new Map<string, AdSpendingData[]>();

    filteredData.forEach((item) => {
      const primaryValue = item[primaryField] || "Unknown";
      if (!groupedData.has(primaryValue)) {
        groupedData.set(primaryValue, []);
      }
      groupedData.get(primaryValue)!.push(item);
    });

    // Calculate aggregated spending for each group
    const aggregatedResults: AggregatedData[] = [];

    groupedData.forEach((items, primaryValue) => {
      // Further group by secondary field if needed
      const secondaryGroups = new Map<string, AdSpendingData[]>();

      items.forEach((item) => {
        const secondaryValue = item[secondaryField] || "Unknown";
        const key = `${primaryValue} - ${secondaryValue}`;
        if (!secondaryGroups.has(key)) {
          secondaryGroups.set(key, []);
        }
        secondaryGroups.get(key)!.push(item);
      });

      secondaryGroups.forEach((groupItems, groupKey) => {
        // Calculate total spend for this group
        const totalSpend = groupItems.reduce((sum, item) => {
          const spend = parseFloat(item.spend || "0");
          return sum + (isNaN(spend) ? 0 : spend);
        }, 0);

        if (totalSpend > 0) {
          aggregatedResults.push({
            id: groupKey,
            label: groupKey,
            value: totalSpend,
            count: groupItems.length,
            fields: {
              [primaryField]: primaryValue,
              [secondaryField]: groupItems[0][secondaryField] || "Unknown",
            },
          });
        }
      });
    });

    // Sort by spending amount (descending) and take top 15 to avoid overcrowding
    return aggregatedResults.sort((a, b) => b.value - a.value).slice(0, 15);
  }, [
    deduplicatedData,
    primaryField,
    secondaryField,
    advertiserFilter,
    electionFilter,
    topicFilter,
  ]);

  // Generate query description
  const getQueryDescription = (): string => {
    const filters = [];
    if (advertiserFilter && advertiserFilter !== "All")
      filters.push(`advertiser "${advertiserFilter}"`);
    if (electionFilter && electionFilter !== "All")
      filters.push(`election "${electionFilter}"`);
    if (topicFilter && topicFilter !== "All")
      filters.push(`topic "${topicFilter}"`);

    const filterText =
      filters.length > 0 ? ` filtered by ${filters.join(", ")}` : "";
    return `Total spending by ${primaryField} and ${secondaryField}${filterText}`;
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

  if (deduplicatedData.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          No data available. Please upload a CSV file to see query results.
        </Typography>
      </Box>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Dynamic Query Chart
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {getQueryDescription()}
        </Typography>

        {/* Query Configuration Controls */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Primary Group</InputLabel>
              <Select
                value={primaryField}
                label="Primary Group"
                onChange={(e: SelectChangeEvent) =>
                  setPrimaryField(e.target.value as QueryField)
                }
              >
                <MenuItem value="advertiser">Advertiser</MenuItem>
                <MenuItem value="topic">Topic</MenuItem>
                <MenuItem value="election">Election</MenuItem>
                <MenuItem value="spend_month">Month</MenuItem>
                <MenuItem value="spend_week">Week</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Secondary Group</InputLabel>
              <Select
                value={secondaryField}
                label="Secondary Group"
                onChange={(e: SelectChangeEvent) =>
                  setSecondaryField(e.target.value as QueryField)
                }
              >
                <MenuItem value="advertiser">Advertiser</MenuItem>
                <MenuItem value="topic">Topic</MenuItem>
                <MenuItem value="election">Election</MenuItem>
                <MenuItem value="spend_month">Month</MenuItem>
                <MenuItem value="spend_week">Week</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Chart Type</InputLabel>
              <Select
                value={chartType}
                label="Chart Type"
                onChange={(e: SelectChangeEvent) =>
                  setChartType(e.target.value as ChartType)
                }
              >
                <MenuItem value="bar">Bar Chart</MenuItem>
                <MenuItem value="pie">Pie Chart</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Advertiser</InputLabel>
              <Select
                value={advertiserFilter}
                label="Advertiser"
                onChange={(e: SelectChangeEvent) =>
                  setAdvertiserFilter(e.target.value)
                }
              >
                {getUniqueValues("advertiser").map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Election</InputLabel>
              <Select
                value={electionFilter}
                label="Election"
                onChange={(e: SelectChangeEvent) =>
                  setElectionFilter(e.target.value)
                }
              >
                {getUniqueValues("election").map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Topic</InputLabel>
              <Select
                value={topicFilter}
                label="Topic"
                onChange={(e: SelectChangeEvent) =>
                  setTopicFilter(e.target.value)
                }
              >
                {getUniqueValues("topic").map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Active Filters Display */}
        {(advertiserFilter && advertiserFilter !== "All") ||
        (electionFilter && electionFilter !== "All") ||
        (topicFilter && topicFilter !== "All") ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Active Filters:
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
              {advertiserFilter && advertiserFilter !== "All" && (
                <Chip
                  label={`Advertiser: ${advertiserFilter}`}
                  size="small"
                  variant="outlined"
                />
              )}
              {electionFilter && electionFilter !== "All" && (
                <Chip
                  label={`Election: ${electionFilter}`}
                  size="small"
                  variant="outlined"
                />
              )}
              {topicFilter && topicFilter !== "All" && (
                <Chip
                  label={`Topic: ${topicFilter}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        ) : null}

        {/* Chart Display */}
        <Box sx={{ height, backgroundColor: "#fafafa", borderRadius: 1, p: 1 }}>
          {processedData.length > 0 ? (
            chartType === "bar" ? (
              <ResponsiveBar
                data={processedData}
                keys={["value"]}
                indexBy="id"
                margin={{ top: 50, right: 130, bottom: 100, left: 80 }}
                padding={0.3}
                valueScale={{ type: "linear" }}
                indexScale={{ type: "band", round: true }}
                colors={{ scheme: "category10" }}
                borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                  legend: `${primaryField} - ${secondaryField}`,
                  legendPosition: "middle",
                  legendOffset: 80,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Total Spending ($)",
                  legendPosition: "middle",
                  legendOffset: -60,
                  format: (value) => formatCurrency(Number(value)),
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
                tooltip={({ data }) => (
                  <div
                    style={{
                      background: "white",
                      padding: "12px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    <strong>{data.id}</strong>
                    <br />
                    Total Spent: {formatCurrency(data.value)}
                    <br />
                    Number of Records: {data.count}
                  </div>
                )}
              />
            ) : (
              <ResponsivePie
                data={processedData}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                colors={{ scheme: "category10" }}
                borderWidth={1}
                borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: "color" }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{
                  from: "color",
                  modifiers: [["darker", 2]],
                }}
                tooltip={({ datum }) => (
                  <div
                    style={{
                      background: "white",
                      padding: "12px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    <strong>{datum.label}</strong>
                    <br />
                    Total Spent: {formatCurrency(datum.value)}
                    <br />
                    Percentage:{" "}
                    {(
                      (datum.value /
                        processedData.reduce((sum, d) => sum + d.value, 0)) *
                      100
                    ).toFixed(1)}
                    %<br />
                    Records: {datum.data.count}
                  </div>
                )}
              />
            )
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
                No data matches the current query and filters
              </Typography>
            </Box>
          )}
        </Box>

        {/* Summary Statistics */}
        {processedData.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Query Results Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Total Spending
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(
                    processedData.reduce((sum, d) => sum + d.value, 0)
                  )}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Total Records
                </Typography>
                <Typography variant="h6">
                  {processedData.reduce((sum, d) => sum + d.count, 0)}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Categories
                </Typography>
                <Typography variant="h6">{processedData.length}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Avg per Category
                </Typography>
                <Typography variant="h6">
                  {formatCurrency(
                    processedData.reduce((sum, d) => sum + d.value, 0) /
                      processedData.length
                  )}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
