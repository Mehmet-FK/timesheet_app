"use client";

import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import { displayDate, parseDisplayDate } from "./timesheetUtils";

export default function DateTextField({ label, value, onChange, fullWidth = true }) {
  const [draft, setDraft] = useState(displayDate(value));

  useEffect(() => {
    setDraft(displayDate(value));
  }, [value]);

  return (
    <TextField
      label={label}
      value={draft}
      fullWidth={fullWidth}
      placeholder="dd.mm.yyyy"
      size="small"
      slotProps={{ htmlInput: { inputMode: "numeric" } }}
      onBlur={() => setDraft(displayDate(value))}
      onChange={(event) => {
        const nextDraft = event.target.value;
        setDraft(nextDraft);
        const parsed = parseDisplayDate(nextDraft);
        if (parsed) onChange(parsed);
      }}
    />
  );
}
