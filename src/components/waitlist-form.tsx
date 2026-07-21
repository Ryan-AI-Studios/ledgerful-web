"use client";

import { useState, type FormEvent } from "react";

type FormStatus =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export function WaitlistForm() {
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();
    const website = String(formData.get("website") ?? "").trim();

    if (!email) {
      setStatus({ kind: "error", message: "Please enter your email address." });
      return;
    }

    setStatus({ kind: "submitting" });

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website, designPartner: false }),
      });

      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
      };

      if (response.ok && body.ok) {
        setStatus({
          kind: "success",
          message:
            body.message ??
            "Thanks. Check your email to confirm your launch-updates subscription.",
        });
        return;
      }

      const message =
        body.message ?? "Something went wrong. Please try again.";
      setStatus({ kind: "error", message });
    } catch {
      setStatus({
        kind: "error",
        message: "We could not submit your request. Please try again.",
      });
    }
  }

  return (
    <div>
      {status.kind === "success" ? (
        <p className="waitlist-message" role="status">
          {status.message}
        </p>
      ) : (
        <form
          action="/api/waitlist"
          method="post"
          noValidate
          className="waitlist-form"
          onSubmit={handleSubmit}
        >
          <div className="waitlist-field">
            <label htmlFor="waitlist-email">Email address</label>
            <input
              id="waitlist-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </div>

          <input
            type="text"
            name="website"
            aria-hidden="true"
            tabIndex={-1}
            autoComplete="off"
            style={{
              position: "absolute",
              left: "-9999px",
              width: "1px",
              height: "1px",
              overflow: "hidden",
            }}
          />

          {status.kind === "error" ? (
            <p className="waitlist-message" role="alert">
              {status.message}
            </p>
          ) : null}

          <button
            type="submit"
            className="waitlist-submit"
            disabled={status.kind === "submitting"}
          >
            {status.kind === "submitting" ? "Submitting…" : "Get updates"}
          </button>

          <p className="waitlist-caveat">
            Launch announcements and changelog updates. Double opt-in — you
            confirm from your inbox.
          </p>
        </form>
      )}
    </div>
  );
}
