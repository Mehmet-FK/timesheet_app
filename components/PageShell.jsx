"use client";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";

export default function PageShell({ children, company, onLogout }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100" }}>
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar>
          <WorkHistoryIcon color="primary" sx={{ mr: 1.5 }} />
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Arbeitszeiten
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Monatslisten fuer Mitarbeiter
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }} />
          {company && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {company.name}
              </Typography>
              <Button variant="outlined" size="small" onClick={onLogout}>
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
