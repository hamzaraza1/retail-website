"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {state.error && (
        <p role="alert" className="m-0 rounded-input bg-nonpta-bg px-3.5 py-3 text-sm font-bold text-nonpta-fg">
          {state.error}
        </p>
      )}
      <label className="flex flex-col gap-1.5 text-sm font-bold">
        Email
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          defaultValue={state.email}
          className="h-12 rounded-input border border-line-strong px-3.5 text-base font-normal"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-bold">
        Password
        <span className="flex h-12 items-center rounded-input border border-line-strong focus-within:outline-2 focus-within:outline-accent">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            className="h-full min-w-0 flex-1 rounded-l-input bg-transparent px-3.5 text-base font-normal outline-none"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-pressed={show}
            className="h-full px-3.5 text-sm font-bold text-muted hover:text-ink"
          >
            {show ? "Chhupayein" : "Dikhayein"}
          </button>
        </span>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-full bg-ink text-base font-bold text-white disabled:opacity-60"
      >
        {pending ? "Login ho raha hai…" : "Login"}
      </button>
      <Link href="/forgot-password" className="flex min-h-11 items-center self-center text-sm font-bold text-ink underline">
        Password bhool gaye?
      </Link>
    </form>
  );
}
