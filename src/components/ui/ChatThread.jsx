import { useState } from "react";
import Icon from "./Icon.jsx";

/**
 * ChatThread
 * -----------------------------------------------------------------------------
 * Message list + composer. Extracted from the vendor chat panel once the
 * Orders screens turned out to draw the identical thread three more times.
 *
 * Figma: vendor chat panel (node 1180:48315) and the order detail dialog's
 * Client / Printing Vendor / Binding Vendor tabs (1180:50943, 51000, 51057).
 * All four frames are the same component with a different heading above it.
 *
 * Bubble treatment is the whole design: the signed-in user's messages are
 * brand-filled, right-aligned and square at the top-right; the other party's
 * are white, left-aligned and square at the top-left with an avatar beside
 * them. The squared-off corner is the tail, so it always points back at its
 * sender.
 *
 * DEVIATION: Figma repeats one stock portrait for every message. Rendered as
 * initials on a brand-tinted circle - the treatment already used for the
 * Attendance approval avatars, since the file has no real per-person images.
 */

const BUBBLE = "flex flex-col gap-1 rounded-lg px-3.5 py-2.5 text-md shadow-sm";

export default function ChatThread({
  messages = [],
  onSend,
  showDayDivider = true,
  dayLabel = "Today",
  placeholder = "Message",
}) {
  const [draft, setDraft] = useState("");

  function send(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    onSend?.(draft);
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-8">
      {showDayDivider && (
        // A rule with the label sitting in the gap.
        <div className="flex items-center gap-2">
          <span className="h-px flex-1 bg-border-default" />
          <span className="text-sm text-tertiary">{dayLabel}</span>
          <span className="h-px flex-1 bg-border-default" />
        </div>
      )}

      <ol className="flex list-none flex-col gap-4 p-0">
        {messages.map((message) => (
          <li
            key={message.id}
            className={[
              "flex gap-3",
              message.own ? "justify-end" : "justify-start",
            ].join(" ")}
          >
            {!message.own && <Avatar name={message.author} />}

            <div className="flex max-w-[70%] flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="flex-1 text-sm font-medium text-secondary">
                  {message.author}
                </span>
                {message.time && (
                  <span className="text-xs text-tertiary">{message.time}</span>
                )}
              </div>

              {message.typing ? (
                <TypingBubble />
              ) : (
                <div
                  className={[
                    BUBBLE,
                    message.own
                      ? "rounded-tr-none bg-brand text-inverse"
                      : "rounded-tl-none bg-surface text-primary",
                  ].join(" ")}
                >
                  <p>{message.body}</p>
                  {message.link && (
                    <a
                      href={message.link}
                      className="underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {message.link}
                    </a>
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>

      <form
        onSubmit={send}
        className="flex items-center gap-3 border-t border-border-default pt-5"
      >
        <label htmlFor="chat-message" className="sr-only">
          {placeholder}
        </label>
        <input
          id="chat-message"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-md border border-border-strong bg-surface px-3.5 py-2.5 text-md text-primary shadow-xs outline-none placeholder:text-tertiary focus:border-border-brand focus:ring-4 focus:ring-ring-brand"
        />
        <button
          type="submit"
          aria-label="Send message"
          className="shrink-0 rounded-md border border-transparent bg-brand p-3 text-inverse shadow-xs transition-opacity hover:opacity-90"
        >
          <Icon name="send" size="md" />
        </button>
      </form>
    </div>
  );
}

/** Initials on a brand-tinted circle, with the online dot from the design. */
function Avatar({ name = "" }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative size-10 shrink-0">
      <div className="flex size-10 items-center justify-center rounded-full bg-brand-subtle text-sm font-semibold text-on-brand">
        {initials}
      </div>
      <span
        aria-hidden
        className="absolute right-0 bottom-0 size-2.5 rounded-full border-[1.5px] border-surface bg-status-success-fg"
      />
    </div>
  );
}

/** The three-dot "still typing" bubble. */
function TypingBubble() {
  return (
    <div
      className={`${BUBBLE} w-fit flex-row items-center gap-1 rounded-tl-none bg-surface`}
      aria-label="Typing"
    >
      {[0, 1, 2].map((i) => (
        <span key={i} className="size-1 rounded-full bg-placeholder" />
      ))}
    </div>
  );
}
