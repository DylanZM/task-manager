import { NextResponse } from "next/server";

type DueEmailBody = {
  to?: string;
  taskTitle?: string;
  dueDate?: string;
  boardName?: string;
};

function validateBody(body: DueEmailBody) {
  if (!body.to || !body.taskTitle || !body.dueDate) {
    return "Missing required fields: to, taskTitle, dueDate.";
  }
  if (!body.to.includes("@")) {
    return "Invalid recipient email.";
  }
  if (Number.isNaN(new Date(body.dueDate).getTime())) {
    return "Invalid dueDate value.";
  }
  return null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as DueEmailBody;
  const validationError = validateBody(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.NOTIFICATION_FROM_EMAIL;

  if (!resendApiKey || !fromEmail) {
    return NextResponse.json(
      {
        error:
          "Email notifications are not configured. Add RESEND_API_KEY and NOTIFICATION_FROM_EMAIL in server env variables.",
      },
      { status: 500 },
    );
  }

  const dueDate = new Date(body.dueDate as string).toLocaleString("es-ES", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#18181b;">
      <h2 style="margin:0 0 12px 0;">Recordatorio de tarea por vencer</h2>
      <p style="margin:0 0 8px 0;"><strong>Tablero:</strong> ${body.boardName ?? "Kanban Board"}</p>
      <p style="margin:0 0 8px 0;"><strong>Tarea:</strong> ${body.taskTitle}</p>
      <p style="margin:0 0 16px 0;"><strong>Vence:</strong> ${dueDate}</p>
      <p style="margin:0;color:#52525b;">Este correo fue generado automáticamente por tu Task Manager.</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [body.to],
      subject: `⏰ Tarea por vencer: ${body.taskTitle}`,
      html,
    }),
  });

  if (!response.ok) {
    const rawError = await response.text();
    return NextResponse.json(
      { error: `Resend API error (${response.status}): ${rawError}` },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
