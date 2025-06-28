"use client";

import React, { useState } from "react";
import {
  normalizePoliticalAdData,
  removeDuplicates,
} from "../utils/dataTransform";
import { setLoading, setcleanData } from "../store/dataSlice";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FormControl from "@mui/material/FormControl";
import Papa from "papaparse";
import { styled } from "@mui/material/styles";
import { useAppDispatch } from "../store/hooks";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

// Define CsvRow type to match your CSV structure
export type CsvRow = {
  advertiser?: string;
  election?: string;
  topic?: string;
  spend_week?: string;
  spend_month?: string;
  spend?: string;
  [key: string]: string | number | undefined;
};

function DataLoader() {
  const dispatch = useAppDispatch();
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0];
    if (file) {
      setIsAnalyzing(true);
      dispatch(setLoading(true));
      console.log("Loading and analyzing CSV file...");

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const csvText = e.target?.result as string;
        Papa.parse<CsvRow>(csvText, {
          header: true, // Set to false if no header row
          complete: (results: Papa.ParseResult<CsvRow>) => {
            try {
              console.log("CSV data loaded and parsed:", results.data.length);
              const normalized = normalizePoliticalAdData(results.data);
              const uniqueData = removeDuplicates(normalized);
              dispatch(setcleanData(uniqueData));
            } catch (error) {
              console.error("Error analyzing CSV data:", error);
              alert("Error processing CSV data");
            } finally {
              setIsAnalyzing(false);
              dispatch(setLoading(false));
            }
          },
          error: (error: Error) => {
            console.error("Error parsing CSV:", error);
            alert("Error parsing CSV file");
            setIsAnalyzing(false);
            dispatch(setLoading(false));
          },
        });
      };
      reader.readAsText(file);
    }
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
          disabled={isAnalyzing}
          sx={{
            backgroundColor: isAnalyzing ? "#ccc" : "#1976d2",
            "&:hover": {
              backgroundColor: isAnalyzing ? "#ccc" : "#1565c0",
            },
          }}
        >
          {isAnalyzing ? "Analyzing CSV..." : "Upload CSV File"}
          <VisuallyHiddenInput
            type="file"
            accept=".csv"
            onChange={(event) => handleFileChange(event)}
          />
        </Button>

        {isAnalyzing && (
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <div>📊 Processing and analyzing your CSV data...</div>
            <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
              This will automatically detect duplicates and save data to Redux
              store
            </div>
          </Box>
        )}
      </FormControl>
    </Box>
  );
}

export default DataLoader;
