"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState
} from "react";

import type {
  DashboardLead
} from "@/lib/dashboard-types";

type DisplayMessage = {
  role: "customer" | "agent";
  text: string;
};

const scenarios = [
  {
    label: "Burst pipe",
    message:
      "A pipe has burst and water is coming through the ceiling."
  },
  {
    label: "Boiler down",
    message:
      "My boiler has stopped working and we have no heating."
  },
  {
    label: "Routine job",
    message:
      "I'd like someone to install a new kitchen tap."
  },
  {
    label: "Gas safety",
    message:
      "I can smell gas near the boiler."
  }
];

function actionLabel(
  action: DashboardLead["action"]
): string {
  const labels: Record<
    DashboardLead["action"],
    string
  > = {
    continue: "CONTINUE QUALIFYING",
    call_now: "CALL NOW",
    book: "READY TO BOOK",
    follow_up: "FOLLOW UP",
    emergency_services:
      "EMERGENCY SAFETY ESCALATION",
    human_review: "HUMAN REVIEW"
  };

  return labels[action];
}

function urgencyLabel(
  urgency: DashboardLead["urgency"]
): string {
  return urgency.toUpperCase();
}

function Metric({
  label,
  value,
  detail
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="metric">
      <div className="eyebrow">
        {label}
      </div>

      <div className="metricValue">
        {value}
      </div>

      {detail && (
        <div className="metricDetail">
          {detail}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  const missing =
    value === "Missing";

  return (
    <div className="fieldRow">
      <span>{label}</span>

      <strong
        className={
          missing ? "missing" : ""
        }
      >
        {value}
      </strong>
    </div>
  );
}

function PipelineStep({
  number,
  title,
  description,
  active,
  complete = false
}: {
  number: string;
  title: string;
  description: string;
  active: boolean;
  complete?: boolean;
}) {
  return (
    <div
      className={`pipelineStep ${
        active
          ? "pipelineActive"
          : ""
      }`}
    >
      <div className="stepNumber">
        {number}
      </div>

      <div>
        <div className="stepTitle">
          {title}

          {complete && (
            <span className="check">
              {" "}✓
            </span>
          )}
        </div>

        <div className="stepDescription">
          {description}
        </div>
      </div>
    </div>
  );
}

function Pipeline({
  lead
}: {
  lead: DashboardLead;
}) {
  const hasEnquiry =
    lead.conversation.messages.length > 0;

  const hasCoreContact =
    Boolean(
      lead.customer.postcode &&
      lead.customer.phone
    );

  const ready =
    lead.stage === "ready_to_book" ||
    lead.action === "book";

  return (
    <div className="pipeline">
      <PipelineStep
        number="01"
        title="ANSWER"
        description="Inbound captured"
        active={hasEnquiry}
        complete={hasEnquiry}
      />

      <PipelineStep
        number="02"
        title="QUALIFY"
        description="Intent + customer data"
        active={hasEnquiry}
        complete={hasCoreContact}
      />

      <PipelineStep
        number="03"
        title="BOOK"
        description="Convert intent to action"
        active={ready}
        complete={ready}
      />

      <PipelineStep
        number="04"
        title="FOLLOW UP"
        description="Recover unfinished demand"
        active={
          lead.action === "follow_up"
        }
      />

      <PipelineStep
        number="05"
        title="RECOVER"
        description={
          lead.commercial
            .revenueAtRiskGBP
            ? `£${lead.commercial.revenueAtRiskGBP} opportunity protected`
            : "Revenue returned to pipeline"
        }
        active={
          lead.commercial
            .revenueAtRiskGBP > 0
        }
      />
    </div>
  );
}

export default function CommandCentre() {
  const [lead, setLead] =
    useState<DashboardLead | null>(
      null
    );

  const [messages, setMessages] =
    useState<DisplayMessage[]>([]);

  const [input, setInput] =
    useState("");

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    void createLead();
  }, []);

  async function createLead() {
    setBusy(true);
    setError(null);

    try {
      const response =
        await fetch(
          "/api/lead",
          {
            cache: "no-store"
          }
        );

      if (!response.ok) {
        throw new Error(
          "Could not create lead."
        );
      }

      const data =
        (await response.json()) as {
          lead: DashboardLead;
        };

      setLead(data.lead);
      setMessages([]);
    } catch {
      setError(
        "Revenue Engine unavailable."
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitMessage(
    message: string
  ) {
    const trimmed =
      message.trim();

    if (
      !trimmed ||
      !lead ||
      busy
    ) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response =
        await fetch(
          "/api/lead",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              lead,
              message: trimmed
            })
          }
        );

      if (!response.ok) {
        throw new Error(
          "Revenue Engine rejected request."
        );
      }

      const data =
        (await response.json()) as {
          lead: DashboardLead;
        };

      const nextLead =
        data.lead;

      const nextMessages:
        DisplayMessage[] = [
          ...messages,
          {
            role: "customer",
            text: trimmed
          }
        ];

      if (
        nextLead.safety
          .emergencyServicesRequired
      ) {
        nextMessages.push({
          role: "agent",
          text:
            "Potential gas or carbon monoxide emergency detected. This requires immediate safety escalation rather than normal booking."
        });
      } else if (
        nextLead.conversation
          .nextQuestion
      ) {
        nextMessages.push({
          role: "agent",
          text:
            nextLead.conversation
              .nextQuestion
        });
      } else if (
        nextLead.action === "book"
      ) {
        nextMessages.push({
          role: "agent",
          text:
            "I have everything I need. This enquiry is ready to book."
        });
      } else if (
        nextLead.action ===
        "call_now"
      ) {
        nextMessages.push({
          role: "agent",
          text:
            "This is a high-priority enquiry. The business should call now."
        });
      }

      setLead(nextLead);
      setMessages(nextMessages);
      setInput("");
    } catch {
      setError(
        "Revenue Engine unavailable."
      );
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    void submitMessage(input);
  }

  function reset() {
    void createLead();
    setInput("");
  }

  const completion =
    useMemo(() => {
      if (!lead) {
        return 0;
      }

      const fields = [
        Boolean(lead.job.problem),
        Boolean(
          lead.customer.postcode
        ),
        lead.job.activeDamage !==
          undefined,
        Boolean(
          lead.customer.phone
        ),
        Boolean(
          lead.customer.name
        ),
        Boolean(
          lead.job.preferredTime
        )
      ];

      return Math.round(
        (
          fields.filter(Boolean)
            .length /
          fields.length
        ) * 100
      );
    }, [lead]);

  if (!lead) {
    return (
      <main className="shell">
        <header className="topbar">
          <div className="brandLockup">
            <div className="mark">
              8
            </div>

            <div>
              <div className="brand">
                8LABS
              </div>

              <div className="productName">
                REVENUE RECOVERY
              </div>
            </div>
          </div>

          <div className="systemStatus">
            <span className="pulse" />
            CONNECTING ENGINE
          </div>
        </header>

        <section className="hero">
          <div>
            <div className="eyebrow">
              REVENUE ENGINE
            </div>

            <h1>
              Connecting to
              <br />
              <span>
                revenue intelligence.
              </span>
            </h1>

            {error && <p>{error}</p>}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brandLockup">
          <div className="mark">
            8
          </div>

          <div>
            <div className="brand">
              8LABS
            </div>

            <div className="productName">
              REVENUE RECOVERY
            </div>
          </div>
        </div>

        <div className="systemStatus">
          <span className="pulse" />
          REAL ENGINE / {lead.channel.toUpperCase()}
        </div>
      </header>

      <section className="hero">
        <div>
          <div className="eyebrow">
            REVENUE INTELLIGENCE / TRADES / V1
          </div>

          <h1>
            Turn missed enquiries
            <br />
            into{" "}
            <span>
              recovered revenue.
            </span>
          </h1>

          <p>
            Answer. Qualify. Book.
            Follow up. Recover. One
            operating layer between
            customer intent and money
            in the bank.
          </p>
        </div>

        <div className="heroStats">
          <Metric
            label="REVENUE AT RISK"
            value={`£${lead.commercial.revenueAtRiskGBP}`}
            detail={
              lead.commercial
                .revenueAtRiskGBP
                ? "Current inbound opportunity"
                : "Waiting for demand"
            }
          />

          <Metric
            label="LEAD SCORE"
            value={`${lead.commercial.score}`}
            detail="/ 100"
          />

          <Metric
            label="COMPLETENESS"
            value={`${completion}%`}
            detail="Canonical lead state"
          />
        </div>
      </section>

      <section className="workspace">
        <div className="conversationPanel">
          <div className="panelHeader">
            <div>
              <div className="eyebrow">
                LIVE CONVERSATION
              </div>

              <h2>
                Inbound intelligence
              </h2>
            </div>

            <button
              className="ghostButton"
              onClick={reset}
              disabled={busy}
            >
              RESET
            </button>
          </div>

          {messages.length === 0 ? (
            <div className="emptyConversation">
              <div className="signalOrb">
                <div className="signalCore" />
              </div>

              <h3>
                Waiting for an enquiry.
              </h3>

              <p>
                Every scenario below now
                runs through the canonical
                8Labs Revenue Engine.
              </p>

              <div className="scenarioRow">
                {scenarios.map(
                  (scenario) => (
                    <button
                      key={
                        scenario.label
                      }
                      disabled={busy}
                      onClick={() =>
                        void submitMessage(
                          scenario.message
                        )
                      }
                    >
                      {scenario.label}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="messages">
              {messages.map(
                (
                  message,
                  index
                ) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`message ${message.role}`}
                  >
                    <div className="messageRole">
                      {message.role ===
                      "customer"
                        ? "CUSTOMER"
                        : "8LABS"}
                    </div>

                    <div>
                      {message.text}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          <form
            className="composer"
            onSubmit={handleSubmit}
          >
            <input
              value={input}
              disabled={busy}
              onChange={(event) =>
                setInput(
                  event.target.value
                )
              }
              placeholder={
                busy
                  ? "Revenue Engine processing..."
                  : "Type the customer's next message..."
              }
            />

            <button
              type="submit"
              disabled={busy}
            >
              {busy
                ? "THINKING"
                : "PROCESS →"}
            </button>
          </form>

          {error && (
            <div
              style={{
                marginTop: 12,
                color: "#ff654f",
                fontSize: 12
              }}
            >
              {error}
            </div>
          )}
        </div>

        <aside className="intelligencePanel">
          <div className="eyebrow">
            OPPORTUNITY INTELLIGENCE
          </div>

          <div
            className={`urgency urgency-${lead.urgency}`}
          >
            <span className="urgencyDot" />

            {urgencyLabel(
              lead.urgency
            )}
          </div>

          <div className="money">
            £
            {
              lead.commercial
                .revenueAtRiskGBP
            }
          </div>

          <div className="moneyLabel">
            REVENUE AT RISK
          </div>

          <div className="scoreTrack">
            <div
              className="scoreFill"
              style={{
                width: `${
                  lead.commercial.score
                }%`
              }}
            />
          </div>

          <div className="scoreMeta">
            <span>
              Opportunity score
            </span>

            <strong>
              {lead.commercial.score}
              /100
            </strong>
          </div>

          <div className="actionBox">
            <div className="eyebrow">
              NEXT BEST ACTION
            </div>

            <strong>
              {actionLabel(
                lead.action
              )}
            </strong>
          </div>

          <div className="questionBox">
            <div className="eyebrow">
              ENGINE DECISION
            </div>

            <p>
              {lead.safety
                .emergencyServicesRequired
                ? lead.safety.reason
                : lead.conversation
                    .nextQuestion ??
                  (lead.action ===
                  "book"
                    ? "Qualification complete. Ready to book."
                    : "No further question required.")}
            </p>
          </div>
        </aside>
      </section>

      <section className="lowerGrid">
        <div className="dataPanel">
          <div className="panelHeader compact">
            <div>
              <div className="eyebrow">
                CUSTOMER INTELLIGENCE
              </div>

              <h2>
                Canonical lead state
              </h2>
            </div>

            <div className="completion">
              {completion}% COMPLETE
            </div>
          </div>

          <div className="fields">
            <Field
              label="Problem"
              value={
                lead.job.problem ??
                "Missing"
              }
            />

            <Field
              label="Postcode"
              value={
                lead.customer
                  .postcode ??
                "Missing"
              }
            />

            <Field
              label="Phone"
              value={
                lead.customer.phone ??
                "Missing"
              }
            />

            <Field
              label="Name"
              value={
                lead.customer.name ??
                "Missing"
              }
            />

            <Field
              label="Preferred time"
              value={
                lead.job
                  .preferredTime ??
                "Missing"
              }
            />

            <Field
              label="Active damage"
              value={
                lead.job.activeDamage ===
                undefined
                  ? "Missing"
                  : lead.job
                        .activeDamage
                    ? "Detected"
                    : "No"
              }
            />

            <Field
              label="Lead stage"
              value={
                lead.stage
                  .replaceAll(
                    "_",
                    " "
                  )
                  .toUpperCase()
              }
            />
          </div>
        </div>

        <div className="pipelinePanel">
          <div className="eyebrow">
            RECOVERY PIPELINE
          </div>

          <h2>
            Intent → revenue
          </h2>

          <Pipeline lead={lead} />
        </div>
      </section>

      <footer>
        <div>
          8LABS / CANONICAL REVENUE ENGINE
        </div>

        <div>
          ANSWER → QUALIFY → BOOK →
          FOLLOW UP → RECOVER
        </div>
      </footer>
    </main>
  );
}
