"use client";

import { useEffect, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import AdminCompanyDialog from "../../components/AdminCompanyDialog";
import AdminCompaniesTable from "../../components/AdminCompaniesTable";
import AdminLoginForm from "../../components/AdminLoginForm";
import PageShell from "../../components/PageShell";
import { deleteAdminCompany, fetchAdminCompanies, saveAdminCompany } from "../../lib/api/adminCompaniesClient";
import { fetchCurrentAdmin, loginAdmin, logoutAdmin } from "../../lib/api/adminAuthClient";

const theme = createTheme({
  palette: {
    primary: { main: "#16745f" },
    background: { default: "#f4f5f2" },
  },
  shape: { borderRadius: 8 },
  typography: { fontFamily: "Arial, Helvetica, sans-serif" },
});

export default function AdminPage() {
  const [admin, setAdmin] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [editCompany, setEditCompany] = useState(null);
  const [expandedId, setExpandedId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAdminWorkspace() {
    try {
      setIsLoading(true);
      const currentAdmin = await fetchCurrentAdmin();
      const result = await fetchAdminCompanies();
      setAdmin(currentAdmin);
      setCompanies(result);
      setError("");
    } catch (requestError) {
      if (requestError.status === 401) {
        setAdmin(null);
        setCompanies([]);
        setError("");
      } else {
        setError(requestError.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAdminWorkspace();
  }, []);

  async function login(credentials) {
    try {
      const loggedInAdmin = await loginAdmin(credentials);
      const result = await fetchAdminCompanies();
      setAdmin(loggedInAdmin);
      setCompanies(result);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function logout() {
    await logoutAdmin();
    setAdmin(null);
    setCompanies([]);
    setEditCompany(null);
  }

  async function saveCompany(company) {
    try {
      await saveAdminCompany(company);
      setEditCompany(null);
      setCompanies(await fetchAdminCompanies());
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function deleteCompany(id) {
    try {
      await deleteAdminCompany(id);
      setCompanies((current) => current.filter((company) => company.id !== id));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PageShell company={admin ? { name: `Admin ${admin.email}` } : null} onLogout={logout}>
        {isLoading && (
          <Stack alignItems="center" sx={{ py: 8 }}>
            <CircularProgress />
          </Stack>
        )}

        {!isLoading && !admin && <AdminLoginForm error={error} onSubmit={login} />}

        {admin && (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" fontWeight={800}>
                Admin Dashboard
              </Typography>
              <Typography color="text.secondary">Manage company accounts, credentials, credits, and usage history.</Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
              <Typography variant="h6" fontWeight={800}>
                Companies
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setEditCompany({ isActive: true })}>
                Add company
              </Button>
            </Stack>

            <AdminCompaniesTable
              companies={companies}
              expandedId={expandedId}
              onToggleHistory={(id) => setExpandedId((current) => (current === id ? "" : id))}
              onEdit={setEditCompany}
              onDelete={deleteCompany}
            />
          </Stack>
        )}

        <AdminCompanyDialog
          open={Boolean(editCompany)}
          company={editCompany}
          onClose={() => setEditCompany(null)}
          onSave={saveCompany}
        />
      </PageShell>
    </ThemeProvider>
  );
}
