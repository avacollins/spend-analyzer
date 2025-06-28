import React, { use, useEffect, useState } from "react";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import Autocomplete from "@mui/material/Autocomplete";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import type { RootState } from "../store/store";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useSelector } from "react-redux";

export default function DataFilters() {
  const filters = useSelector((state: RootState) => state.data.filters);
  const data = useSelector((state: RootState) => state.data.cleanData);

  const [queryOptions, setQueryOptions] = useState<Record<string, unknown>>({});

  const spendBy = ["total", "average"];

  useEffect(() => {
    if (filters && Object.keys(filters).length > 0 && data && data.length > 0) {
      const q: Record<string, unknown> = {};
      Object.keys(filters).forEach((filter) => {
        q[filter] = {
          label: filter.replace("_", " "),
          options: data
            .map((item) => item[filter])
            .filter((value, index, self) => {
              return (
                self.indexOf(value) === index &&
                value !== null &&
                value !== undefined
              );
            }),
        };
      });
      setQueryOptions(q);
    }
  }, [filters, data]);

  return (
    <Stack spacing={3} sx={{ minWidth: 250, pt: 5 }}>
      {Object.entries(queryOptions).map(([key, option]) => (
        <Autocomplete
          key={key}
          multiple
          id={`${key}-autocomplete`}
          options={option.options}
          renderInput={(params) => (
            <TextField
              {...params}
              label={option.label}
              placeholder="Select..."
            />
          )}
        />
      ))}
      <FormControl fullWidth>
        <InputLabel id="filter-select-label">spend </InputLabel>
        <Select
          labelId="filter-select-label"
          id="filter-select"
          value={spendBy[0]}
          label="Spend By"
          onChange={(event: SelectChangeEvent) => {
            // Handle filter change logic here
          }}
        >
          {spendBy.map((key) => (
            <MenuItem key={key} value={key}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
