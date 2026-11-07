import { getParticipantByToken } from "@/app/actions/participants";
import { LOCATION } from "@/lib/location";

const DURATION_MS = 4 * 60 * 60 * 1000;

function toIcsDate(date: Date) {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function escapeText(value: string) {
  return value.replace(/[\\;,]/g, (char) => `\\${char}`).replace(/\n/g, "\\n");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const participant = await getParticipantByToken(token);

  if (!participant || !participant.session) {
    return new Response("Nicht gefunden.", { status: 404 });
  }

  const { session } = participant;
  const start = session.celebrationAt;
  const end = new Date(start.getTime() + DURATION_MS);

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wichtel4family//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${session.id}@wichtel4family`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeText(session.name)}`,
    `DESCRIPTION:${escapeText("Wichteln mit der ganzen Familie")}`,
    `LOCATION:${escapeText(LOCATION.address)}`,
    `GEO:${LOCATION.lat};${LOCATION.lng}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="weihnachtsfeier.ics"',
      "Cache-Control": "no-store",
    },
  });
}
