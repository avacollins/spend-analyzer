"use client";

import * as React from "react";

import AdvertiserSpendingOverTime from "./components/AdvertiserSpendingOverTime";
import Box from "@mui/material/Box";
import DataLoader from "./components/DataLoader";
import QueryChart from "./components/QueryChart";
import type { RootState } from "./store/store";
import { Typography } from "@mui/material";
import { useSelector } from "react-redux";

export default function Home() {
  const data = useSelector((state: RootState) => state.data.cleanData);

  React.useEffect(() => {
    // Log the data to the console for debugging
    console.log("Clean Data:", data.length);
  }, [data]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "justify",
        justifyContent: "stretch",
        minHeight: "100vh",
      }}
    >
      {!data ||
        (data.length === 0 && (
          <Box
            sx={{
              backgroundColor: "#fff",
              p: 4,
              flexGrow: 1,
              minWidth: "300px",
            }}
          >
            <DataLoader />{" "}
          </Box>
        ))}

      <Box
        sx={{
          backgroundColor: "#f0f0f0",
          flexGrow: 5,
          color: "#333",
        }}
      >
        <Typography variant="h4" sx={{ p: 2, textAlign: "center" }}>
          Political Ad Spending Dashboard
        </Typography>
        {data.length > 0 && (
          <>
            <QueryChart height={400} />

            <AdvertiserSpendingOverTime height={500} />
          </>
        )}
      </Box>
    </Box>
  );
}
