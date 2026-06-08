"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import DateTextField from "./DateTextField";
import { ABSENCE_TYPES, AUSTRIAN_HOLIDAY_DEFINITIONS, calculateWeeklyHours, emptyCoworker, makeId, WEEKDAYS } from "./timesheetUtils";

function cloneCoworker(coworker) {
  const cloned = JSON.parse(JSON.stringify(coworker || { ...emptyCoworker, id: makeId() }));
  return {
    ...emptyCoworker,
    ...cloned,
    holidayDates: cloned.holidayDates || [],
  };
}

export default function CoworkerDialog({ open, coworker, onClose, onSave, onDelete }) {
  const [draft, setDraft] = useState(cloneCoworker(coworker));
  const [tab, setTab] = useState(0);
  const holidays = useMemo(() => AUSTRIAN_HOLIDAY_DEFINITIONS, []);

  useEffect(() => {
    setDraft(cloneCoworker(coworker));
    setTab(0);
  }, [coworker, open]);

  const weeklyHours = calculateWeeklyHours(draft);

  function update(updates) {
    setDraft((current) => {
      const next = { ...current, ...updates };
      return { ...next, hoursPerWeek: Number(calculateWeeklyHours(next).toFixed(2)) };
    });
  }

  function toggleWeekday(dayKey) {
    const exists = draft.weekdays.includes(dayKey);
    const weekdays = exists ? draft.weekdays.filter((day) => day !== dayKey) : [...draft.weekdays, dayKey];
    update({
      weekdays: weekdays.sort(
        (a, b) => WEEKDAYS.findIndex((day) => day.key === a) - WEEKDAYS.findIndex((day) => day.key === b)
      ),
    });
  }

  function updateDailyTime(dayKey, field, value) {
    update({
      dailyTimes: {
        ...draft.dailyTimes,
        [dayKey]: {
          ...draft.dailyTimes[dayKey],
          [field]: value,
        },
      },
    });
  }

  function addAbsence(type) {
    update({
      absences: [...draft.absences, { id: makeId(), type, from: draft.entryDate || "2026-05-01", to: draft.entryDate || "2026-05-01" }],
    });
  }

  function updateAbsence(id, field, value) {
    update({
      absences: draft.absences.map((absence) => (absence.id === id ? { ...absence, [field]: value } : absence)),
    });
  }

  function removeAbsence(id) {
    update({ absences: draft.absences.filter((absence) => absence.id !== id) });
  }

  function toggleHoliday(key) {
    update({
      holidayDates: draft.holidayDates.includes(key)
        ? draft.holidayDates.filter((holidayKey) => holidayKey !== key)
        : [...draft.holidayDates, key].sort(),
    });
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{coworker?.id ? "Mitarbeiter bearbeiten" : "Mitarbeiter anlegen"}</DialogTitle>
      <DialogContent dividers>
        <Tabs value={tab} onChange={(_event, value) => setTab(value)} sx={{ mb: 3 }}>
          <Tab label="Stammdaten" />
          <Tab label="Abwesenheiten" />
          <Tab label="Feiertage" />
        </Tabs>

        {tab === 0 && (
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField label="Name" value={draft.name} onChange={(event) => update({ name: event.target.value })} fullWidth size="small" />
              </Grid>
              <Grid item xs={12} md={6}>
                <DateTextField label="Eintrittsdatum" value={draft.entryDate} onChange={(value) => update({ entryDate: value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Sozialversicherungsnummer"
                  value={draft.socialSecurityNumber}
                  onChange={(event) => update({ socialSecurityNumber: event.target.value })}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Wochenstunden" value={weeklyHours.toFixed(2)} fullWidth size="small" InputProps={{ readOnly: true }} />
              </Grid>
            </Grid>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Arbeitstage
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {WEEKDAYS.map((day) => (
                  <FormControlLabel
                    key={day.key}
                    control={<Checkbox checked={draft.weekdays.includes(day.key)} onChange={() => toggleWeekday(day.key)} />}
                    label={day.short}
                  />
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Tageszeiten
              </Typography>
              <Grid container spacing={1.5}>
                {WEEKDAYS.map((day) => {
                  const isWorkingDay = draft.weekdays.includes(day.key);

                  return (
                    <Grid item xs={12} md={6} key={day.key}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography sx={{ width: 96 }} color={isWorkingDay ? "text.primary" : "text.disabled"}>
                          {day.label}
                        </Typography>
                        <TextField
                          type="time"
                          label="Von"
                          value={draft.dailyTimes[day.key]?.from ?? ""}
                          onChange={(event) => updateDailyTime(day.key, "from", event.target.value)}
                          size="small"
                          disabled={!isWorkingDay}
                          inputProps={{ step: 300, pattern: "[0-9]{2}:[0-9]{2}", lang: "de-AT" }}
                        />
                        <TextField
                          type="time"
                          label="Bis"
                          value={draft.dailyTimes[day.key]?.to ?? ""}
                          onChange={(event) => updateDailyTime(day.key, "to", event.target.value)}
                          size="small"
                          disabled={!isWorkingDay}
                          inputProps={{ step: 300, pattern: "[0-9]{2}:[0-9]{2}", lang: "de-AT" }}
                        />
                      </Stack>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Stack>
        )}

        {tab === 1 && (
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography variant="subtitle2">Abwesenheiten</Typography>
              <Stack direction="row" spacing={1}>
                {Object.entries(ABSENCE_TYPES).map(([key, label]) => (
                  <Button key={key} size="small" startIcon={<AddIcon />} onClick={() => addAbsence(key)}>
                    {label}
                  </Button>
                ))}
              </Stack>
            </Stack>
            <Stack spacing={1}>
              {draft.absences.map((absence) => (
                <Grid container spacing={1} alignItems="center" key={absence.id}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      select
                      label="Typ"
                      value={absence.type}
                      onChange={(event) => updateAbsence(absence.id, "type", event.target.value)}
                      fullWidth
                      size="small"
                    >
                      {Object.entries(ABSENCE_TYPES).map(([key, label]) => (
                        <MenuItem key={key} value={key}>
                          {label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <DateTextField label="Von" value={absence.from} onChange={(value) => updateAbsence(absence.id, "from", value)} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <DateTextField label="Bis" value={absence.to} onChange={(value) => updateAbsence(absence.id, "to", value)} />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <IconButton aria-label="Abwesenheit entfernen" onClick={() => removeAbsence(absence.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              {!draft.absences.length && (
                <Typography color="text.secondary" variant="body2">
                  Keine Abwesenheiten erfasst.
                </Typography>
              )}
            </Stack>
          </Box>
        )}

        {tab === 2 && (
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="body2">
              Aktivierte Feiertage werden im Export als Feiertag angezeigt und wie geplante Arbeitszeit gezaehlt.
            </Typography>
            {holidays.map((holiday) => (
              <FormControlLabel
                key={holiday.key}
                control={<Checkbox checked={draft.holidayDates.includes(holiday.key)} onChange={() => toggleHoliday(holiday.key)} />}
                label={holiday.name}
              />
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        {coworker?.id && (
          <Button color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(draft.id)}>
            Loeschen
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Abbrechen</Button>
        <Button variant="contained" onClick={() => onSave({ ...draft, hoursPerWeek: Number(weeklyHours.toFixed(2)) })}>
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
}
