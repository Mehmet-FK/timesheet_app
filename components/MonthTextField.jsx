"use client";

import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import { displayMonthInput, parseMonthInput } from "./timesheetUtils";

export default function MonthTextField({ label, value, onChange }) {
  const [draft, setDraft] = useState(displayMonthInput(value));

  useEffect(() => {
    setDraft(displayMonthInput(value));
  }, [value]);

  return (
    <TextField
      label={label}
      value={draft}
      fullWidth
      placeholder="mm.yyyy"
      size="small"
      slotProps={{ htmlInput: { inputMode: "numeric" } }}
      onBlur={() => setDraft(displayMonthInput(value))}
      onChange={(event) => {
        const nextDraft = event.target.value;
        setDraft(nextDraft);
        const parsed = parseMonthInput(nextDraft);
        if (parsed) onChange(parsed);
      }}
    />
  );
}
