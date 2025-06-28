import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface AdSpendingData {
  advertiser?: string;
  election?: string;
  topic?: string;
  spend_week?: string;
  spend_month?: string;
  spend?: string;
  [key: string]: string | number | undefined; // Allow for additional CSV columns
}

export interface DataState {
  cleanData: AdSpendingData[];
  isLoading: boolean;
  lastUpdated: string | null;
  filters: {
    advertiser: string;
    election: string;
    topic: string;
    spend_month: string;
  };
}

const initialState: DataState = {
  cleanData: [],
  isLoading: false,
  lastUpdated: null,
  filters: {
    advertiser: "",
    election: "",
    topic: "",
    spend_month: "",
  },
};

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setcleanData: (state, action: PayloadAction<AdSpendingData[]>) => {
      state.cleanData = action.payload;
      state.lastUpdated = new Date().toISOString();
    },

    setFilter: (
      state,
      action: PayloadAction<{ key: keyof DataState["filters"]; value: string }>
    ) => {
      state.filters[action.payload.key] = action.payload.value;
    },

    clearFilters: (state) => {
      state.filters = {
        advertiser: "",
        election: "",
        topic: "",
        spend_month: "",
      };
    },

    clearAllData: (state) => {
      state.cleanData = [];
      state.lastUpdated = null;
    },
  },
});

export const {
  setLoading,
  setcleanData,
  setFilter,
  clearFilters,
  clearAllData,
} = dataSlice.actions;

export default dataSlice.reducer;
