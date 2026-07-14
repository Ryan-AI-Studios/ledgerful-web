import { NextRequest, NextResponse } from "next/server";

// NOTE: The Kit double-opt-in / auto-responder email template must also say
// "launch updates" (not the old pre-launch framing) to match this framing.
// That is a Kit account platform change, not a repo edit — update it in the
// Kit dashboard alongside this code change.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KIT_API_BASE = "https://api.kit.com/v4";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request body." },
      { status: 400 },
    );
  }

  const data = body as Record<string, unknown>;
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const honeypot = typeof data.website === "string" ? data.website.trim() : "";
  const designPartner =
    typeof data.designPartner === "boolean" ? data.designPartner : false;

  if (honeypot) {
    return NextResponse.json(
      { ok: true, message: "Thanks. Check your email to confirm your launch-updates subscription." },
      { status: 200 },
    );
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, message: "Please enter a valid email address." },
      { status: 422 },
    );
  }

  const apiKey = process.env.KIT_API_KEY;
  const formId = process.env.KIT_FORM_ID;

  if (!apiKey || !formId) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "We could not process your request right now. Please try again later.",
      },
      { status: 503 },
    );
  }

  try {
    const fields: Record<string, string> = {};
    if (designPartner) {
      fields.design_partner = "true";
    }

    const createResponse = await fetch(`${KIT_API_BASE}/subscribers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kit-Api-Key": apiKey,
      },
      body: JSON.stringify({
        email_address: email,
        state: "inactive",
        ...(Object.keys(fields).length > 0 ? { fields } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (createResponse.status === 401) {
      return NextResponse.json(
        {
          ok: false,
          message: "We could not process your request right now. Please try again later.",
        },
        { status: 500 },
      );
    }

    if (createResponse.status === 422) {
      const errorBody = (await createResponse.json().catch(() => null)) as
        | { errors?: string[] }
        | null;
      const msg =
        errorBody?.errors?.[0] ?? "Please enter a valid email address.";
      return NextResponse.json(
        { ok: false, message: msg },
        { status: 422 },
      );
    }

    if (!createResponse.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: "We could not process your request right now. Please try again later.",
        },
        { status: 502 },
      );
    }

    const formResponse = await fetch(
      `${KIT_API_BASE}/forms/${formId}/subscribers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Kit-Api-Key": apiKey,
        },
        body: JSON.stringify({
          email_address: email,
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (!formResponse.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: "We could not process your request right now. Please try again later.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message:
          "Thanks. Check your email to confirm your launch-updates subscription — double opt-in keeps the list real.",
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "We could not process your request right now. Please try again later.",
      },
      { status: 500 },
    );
  }
}