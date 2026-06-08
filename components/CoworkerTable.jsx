"use client";

import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { displayDate, WEEKDAYS } from "./timesheetUtils";

function weekdayText(coworker) {
  return WEEKDAYS.filter((day) => coworker.weekdays.includes(day.key))
    .map((day) => day.short)
    .join(", ");
}

export default function CoworkerTable({ coworkers, onEdit, onExport }) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Eintritt</TableCell>
            <TableCell>SV-Nummer</TableCell>
            <TableCell>Arbeitstage</TableCell>
            <TableCell align="right">Wochenstunden</TableCell>
            <TableCell align="right">Aktionen</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {coworkers.map((coworker) => (
            <TableRow key={coworker.id} hover>
              <TableCell>
                <Typography fontWeight={700}>{coworker.name || "Ohne Namen"}</Typography>
              </TableCell>
              <TableCell>{displayDate(coworker.entryDate)}</TableCell>
              <TableCell>{coworker.socialSecurityNumber || "-"}</TableCell>
              <TableCell>{weekdayText(coworker) || "-"}</TableCell>
              <TableCell align="right">{coworker.hoursPerWeek}</TableCell>
              <TableCell align="right">
                <Tooltip title="Mitarbeiter bearbeiten">
                  <IconButton onClick={() => onEdit(coworker)} color="primary">
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Timesheet exportieren">
                  <IconButton onClick={() => onExport(coworker)} color="primary">
                    <FileDownloadIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
          {!coworkers.length && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                Keine Mitarbeiter angelegt.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
