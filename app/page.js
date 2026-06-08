"use client";

import { useEffect, useMemo, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import CoworkerDialog from "../components/CoworkerDialog";
import CoworkerTable from "../components/CoworkerTable";
import LoginForm from "../components/LoginForm";
import PageShell from "../components/PageShell";
import TimesheetDialog from "../components/TimesheetDialog";
import { fetchCurrentCompany, loginCompany, logoutCompany } from "../lib/api/authClient";
import { fetchCoworkers, persistCoworker, removeCoworker } from "../lib/api/coworkersClient";
import { authorizeTimesheetGeneration } from "../lib/api/usageEventsClient";
import {
  EXPORT_HEADERS,
  displayDateRange,
  displayMonth,
  emptyCoworker,
  generateEntries,
  groupEntriesByMonth,
  makeCsv,
  makeExportRows,
  makeId,
  countMonths,
  minutesToHours,
  monthRangeToDateRange,
  safeFilePart,
} from "../components/timesheetUtils";

const theme = createTheme({
  palette: {
    primary: {
      main: "#16745f",
    },
    background: {
      default: "#f4f5f2",
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: "Arial, Helvetica, sans-serif",
  },
});

function downloadCsv(entries, range) {
  const blob = new Blob([makeCsv(entries)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `arbeitszeiten-${displayDateRange(range.from, range.to)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadPdf(coworker, entries, range) {
  const doc = new jsPDF({ orientation: "landscape" });
  const coworkerName = coworker?.name || "Alle Mitarbeiter";
  const dateRange = displayDateRange(range.from, range.to);
  const monthGroups = groupEntriesByMonth(entries);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  Object.entries(monthGroups).forEach(([monthKey, monthEntries], index) => {
    if (index > 0) doc.addPage();
    const monthWorkMinutes = monthEntries.reduce((sum, row) => sum + row.workMinutes, 0);

    doc.setFontSize(15);
    doc.text("Arbeitszeitnachweis", 14, 16);
    doc.setFontSize(10);
    doc.text(`Name: ${coworkerName}`, 14, 25);
    doc.text(`SV-Nummer: ${coworker?.socialSecurityNumber || "-"}`, 14, 31);
    doc.text(`Monat: ${displayMonth(monthKey)}`, 14, 37);

    doc.setFontSize(11);
    doc.text(`Gesamtstunden: ${minutesToHours(monthWorkMinutes)} h`, pageWidth - 14, 25, {
      align: "right",
    });

    autoTable(doc, {
      head: [EXPORT_HEADERS],
      body: makeExportRows(monthEntries),
      startY: 44,
      margin: { bottom: 34 },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [22, 116, 95] },
      alternateRowStyles: { fillColor: [247, 248, 245] },
    });

    doc.setFontSize(9);
    doc.line(14, pageHeight - 20, 96, pageHeight - 20);
    doc.text("Unterschrift Mitarbeiter", 14, pageHeight - 14);
  });

  doc.save(`arbeitszeiten-${safeFilePart(coworkerName)}-${dateRange}.pdf`);
}

export default function Home() {
  const [coworkers, setCoworkers] = useState([]);
  const [editCoworker, setEditCoworker] = useState(null);
  const [exportCoworker, setExportCoworker] = useState(null);
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadWorkspace() {
    try {
      setIsLoading(true);
      const currentCompany = await fetchCurrentCompany();
      const savedCoworkers = await fetchCoworkers();
      setCompany(currentCompany);
      setCoworkers(savedCoworkers);
      setError("");
    } catch (requestError) {
      if (requestError.status === 401) {
        setCompany(null);
        setCoworkers([]);
        setError("");
      } else {
        setError(requestError.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadWorkspace();
  }, []);

  const totals = useMemo(
    () => ({
      people: coworkers.length,
      hours: coworkers.reduce((sum, coworker) => sum + Number(coworker.hoursPerWeek || 0), 0),
    }),
    [coworkers]
  );

  function openNewCoworker() {
    setEditCoworker({ ...emptyCoworker, id: makeId(), name: "Neue Person" });
  }

  async function saveCoworker(coworker) {
    try {
      const saved = await persistCoworker(coworker);
      setCoworkers((current) => {
        const exists = current.some((person) => person.id === saved.id);
        return exists ? current.map((person) => (person.id === saved.id ? saved : person)) : [...current, saved];
      });
      setEditCoworker(null);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function login(credentials) {
    try {
      const loggedInCompany = await loginCompany(credentials);
      const savedCoworkers = await fetchCoworkers();
      setCompany(loggedInCompany);
      setCoworkers(savedCoworkers);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function logout() {
    await logoutCompany();
    setCompany(null);
    setCoworkers([]);
    setEditCoworker(null);
    setExportCoworker(null);
  }

  async function deleteCoworker(id) {
    try {
      await removeCoworker(id);
      setCoworkers((current) => current.filter((person) => person.id !== id));
      setEditCoworker(null);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function exportTimesheet({ coworker, monthRange, format, randomize }) {
    const range = monthRangeToDateRange(monthRange);
    const credits = countMonths(monthRange);
    const entries = generateEntries([coworker], range.from, range.to, { randomize });
    if (!entries.length) return;

    try {
      const authorization = await authorizeTimesheetGeneration({ coworker, range, format, credits });
      setCompany((current) => ({ ...current, creditBalance: authorization.creditBalance }));
      setError("");
    } catch (requestError) {
      setError(requestError.message);
      return;
    }

    if (format === "csv") {
      downloadCsv(entries, range);
    } else {
      downloadPdf(coworker, entries, range);
    }

    setExportCoworker(null);
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PageShell company={company} onLogout={logout}>
        {isLoading && !company && (
          <Stack alignItems="center" sx={{ py: 8 }}>
            <CircularProgress />
          </Stack>
        )}

        {!isLoading && !company && <LoginForm error={error} onSubmit={login} />}

        {company && (
          <>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
              <div>
                <Typography variant="h4" fontWeight={800}>
                  Mitarbeiter
                </Typography>
                <Typography color="text.secondary">
                  {totals.people} Personen / {totals.hours.toFixed(2)} geplante Wochenstunden / {company.creditBalance ?? 0} Credits
                </Typography>
              </div>
              <Button variant="contained" startIcon={<AddIcon />} onClick={openNewCoworker}>
                Mitarbeiter anlegen
              </Button>
            </Stack>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {isLoading ? (
              <Stack alignItems="center" sx={{ py: 8 }}>
                <CircularProgress />
              </Stack>
            ) : (
              <CoworkerTable coworkers={coworkers} onEdit={setEditCoworker} onExport={setExportCoworker} />
            )}

            <CoworkerDialog
              open={Boolean(editCoworker)}
              coworker={editCoworker}
              onClose={() => setEditCoworker(null)}
              onSave={saveCoworker}
              onDelete={deleteCoworker}
            />

            <TimesheetDialog
              open={Boolean(exportCoworker)}
              coworker={exportCoworker}
              onClose={() => setExportCoworker(null)}
              onExport={exportTimesheet}
            />
          </>
        )}
      </PageShell>
    </ThemeProvider>
  );
}
