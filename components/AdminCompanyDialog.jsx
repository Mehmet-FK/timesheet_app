"use client";

import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import DateTextField from "./DateTextField";

const emptyCompany = {
  name: "",
  ownerName: "",
  email: "",
  accountCreationDate: new Date().toISOString().slice(0, 10),
  creditBalance: 0,
  password: "",
  isActive: true,
};

export default function AdminCompanyDialog({ open, company, onClose, onSave }) {
  const [draft, setDraft] = useState(emptyCompany);

  useEffect(() => {
    setDraft(company ? { ...emptyCompany, ...company, password: "" } : emptyCompany);
  }, [company, open]);

  function update(updates) {
    setDraft((current) => ({ ...current, ...updates }));
  }

  const canSave = draft.name.trim() && draft.email.trim() && (draft.id || draft.password.trim());

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{draft.id ? "Company bearbeiten" : "Company anlegen"}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField label="Company owner" value={draft.ownerName} onChange={(event) => update({ ownerName: event.target.value })} fullWidth />
          <TextField label="Company name" value={draft.name} onChange={(event) => update({ name: event.target.value })} fullWidth required />
          <DateTextField
            label="Account creation date"
            value={draft.accountCreationDate}
            onChange={(value) => update({ accountCreationDate: value })}
          />
          <TextField
            label="Credits"
            type="number"
            value={draft.creditBalance}
            onChange={(event) => update({ creditBalance: Number(event.target.value) })}
            fullWidth
            inputProps={{ min: 0, step: 1 }}
          />
          <TextField label="Username / Email" type="email" value={draft.email} onChange={(event) => update({ email: event.target.value })} fullWidth required />
          <TextField
            label={draft.id ? "New password" : "Password"}
            type="password"
            value={draft.password}
            onChange={(event) => update({ password: event.target.value })}
            fullWidth
            helperText={draft.id ? "Leave empty to keep current password." : ""}
            required={!draft.id}
          />
          <FormControlLabel
            control={<Switch checked={draft.isActive} onChange={(event) => update({ isActive: event.target.checked })} />}
            label="Active"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button variant="contained" onClick={() => onSave(draft)} disabled={!canSave}>
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
}
