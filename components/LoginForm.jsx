"use client";

import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import LoginIcon from "@mui/icons-material/Login";

export default function LoginForm({ error, onSubmit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    await onSubmit({ email, password });
    setIsSubmitting(false);
  }

  return (
    <Box sx={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
      <Paper component="form" variant="outlined" onSubmit={submit} sx={{ width: "100%", maxWidth: 420, p: 3 }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Company Login
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Sign in to manage coworkers and generate timesheets.
            </Typography>
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            fullWidth
            required
          />
          <Button type="submit" variant="contained" size="large" startIcon={<LoginIcon />} disabled={isSubmitting}>
            Login
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
