"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MonthTextField from "./MonthTextField";
import { countMonths, displayMonthInput } from "./timesheetUtils";

export default function TimesheetDialog({ open, coworker, onClose, onExport }) {
  const [monthRange, setMonthRange] = useState({ from: "2026-05", to: "2026-05" });
  const [format, setFormat] = useState("pdf");
  const [randomize, setRandomize] = useState(true);
  const credits = countMonths(monthRange);

  function submit() {
    onExport({ coworker, monthRange, format, randomize });
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Timesheet exportieren</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Typography color="text.secondary">
            {coworker?.name || "Mitarbeiter"} / {displayMonthInput(monthRange.from)} - {displayMonthInput(monthRange.to)} / {credits} credits
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <MonthTextField label="Von" value={monthRange.from} onChange={(value) => setMonthRange({ ...monthRange, from: value })} />
            <MonthTextField label="Bis" value={monthRange.to} onChange={(value) => setMonthRange({ ...monthRange, to: value })} />
          </Stack>
          <FormControl>
            <RadioGroup row value={format} onChange={(event) => setFormat(event.target.value)}>
              <FormControlLabel value="pdf" control={<Radio />} label="PDF" />
              <FormControlLabel value="csv" control={<Radio />} label="CSV" />
            </RadioGroup>
          </FormControl>
          <FormControlLabel
            control={<Checkbox checked={randomize} onChange={(event) => setRandomize(event.target.checked)} />}
            label="Die Zeiteinträge abweichen"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button variant="contained" onClick={submit} disabled={credits < 1}>
          Exportieren
        </Button>
      </DialogActions>
    </Dialog>
  );
}
