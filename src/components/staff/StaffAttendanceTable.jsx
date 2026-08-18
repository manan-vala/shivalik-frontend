import Button from "../ui/Button.jsx";
import AttendanceDecision from "../ui/AttendanceDecision.jsx";
import { TableCard, Table, THead, TBody, TR, TH, TD } from "../ui/Table.jsx";

/**
 * StaffAttendanceTable
 * Figma: FINAL SCREENS / Shivalik Final / Attendance table (node 1181:84722),
 * inside the Staff > Attendance screen (1181:84672).
 *
 * Name / Today (AttendanceDecision - dropdown + Reject/Approve or a locked
 * outcome badge) / Attendance (a fraction, e.g. "28/30") / View.
 */
export default function StaffAttendanceTable({ rows, onStateChange, onDecide, onView }) {
  return (
    <TableCard>
      <Table>
        <THead>
          <TR>
            <TH>Name</TH>
            <TH>Today</TH>
            <TH align="center">Attendance</TH>
            <TH align="right">
              <span className="sr-only">Action</span>
            </TH>
          </TR>
        </THead>

        <TBody>
          {rows.map((row) => (
            <TR key={row.id}>
              <TD className="font-medium text-primary">{row.name}</TD>
              <TD>
                <AttendanceDecision
                  name={row.name}
                  state={row.state}
                  outcome={row.outcome}
                  onStateChange={(value) => onStateChange?.(row.id, value)}
                  onDecide={(outcome) => onDecide?.(row.id, outcome)}
                />
              </TD>
              <TD align="center" className="tabular font-medium text-primary">
                {row.attendance}
              </TD>
              <TD align="right">
                <Button variant="linkBrand" onClick={() => onView?.(row)}>
                  View
                </Button>
              </TD>
            </TR>
          ))}

          {rows.length === 0 && (
            <TR>
              <TD colSpan={4} align="center" className="text-tertiary">
                No staff match this search.
              </TD>
            </TR>
          )}
        </TBody>
      </Table>
    </TableCard>
  );
}
