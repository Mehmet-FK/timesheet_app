"use client";

import { Fragment } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import HistoryIcon from "@mui/icons-material/History";
import { displayDate, displayDateRange } from "./timesheetUtils";

function eventText(event) {
  if (event.eventType === "coworker_created") {
    return `Added coworker ${event.coworkerName || "-"}`;
  }

  if (event.eventType === "timesheet_generated") {
    return `Generated ${String(event.format || "").toUpperCase()} timesheet for ${event.coworkerName || "-"} (${displayDateRange(
      event.dateRangeFrom,
      event.dateRangeTo
    )}) / ${event.creditsUsed || 0} credits`;
  }

  return event.eventType;
}

export default function AdminCompaniesTable({ companies, expandedId, onToggleHistory, onEdit, onDelete }) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Company</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell>Username / Email</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right">Credits</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {companies.map((company) => (
            <Fragment key={company.id}>
              <TableRow key={company.id} hover>
                <TableCell>
                  <Typography fontWeight={700}>{company.name}</Typography>
                </TableCell>
                <TableCell>{company.ownerName || "-"}</TableCell>
                <TableCell>{company.email}</TableCell>
                <TableCell>{displayDate(company.accountCreationDate || String(company.createdAt).slice(0, 10))}</TableCell>
                <TableCell align="right">{company.creditBalance ?? 0}</TableCell>
                <TableCell>
                  <Chip size="small" color={company.isActive ? "success" : "default"} label={company.isActive ? "Active" : "Inactive"} />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Usage history">
                    <IconButton onClick={() => onToggleHistory(company.id)}>
                      <HistoryIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit company">
                    <IconButton color="primary" onClick={() => onEdit(company)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete company">
                    <IconButton color="error" onClick={() => onDelete(company.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={7} sx={{ p: 0, borderBottom: expandedId === company.id ? 1 : 0 }}>
                  <Collapse in={expandedId === company.id} timeout="auto" unmountOnExit>
                    <Box sx={{ p: 2, bgcolor: "grey.50" }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Usage history
                      </Typography>
                      <Stack spacing={1}>
                        {(company.usageEvents || []).map((event) => (
                          <Paper key={event.id} variant="outlined" sx={{ p: 1.5 }}>
                            <Typography variant="body2">{eventText(event)}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(event.createdAt).toLocaleString()}
                            </Typography>
                          </Paper>
                        ))}
                        {!company.usageEvents?.length && (
                          <Typography color="text.secondary" variant="body2">
                            No usage events yet.
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
