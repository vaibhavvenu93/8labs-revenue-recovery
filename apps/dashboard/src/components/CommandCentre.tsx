"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  analyseDemoMessage,
  DemoLead,
  initialLead,
} from "@/lib/demo-engine";

type Message = {
  role: "customer" | "agent";
  text: string;
};

const scenarios = [
  {
    label: "Burst pipe",
    message:
      "A pipe has burst and water is coming through the ceiling.",
  },
  {
    label: "Boiler down",
    message:
      "My boiler has stopped working and we have no heating.",
  },
  {
    label: "Routine job",
    message:
      "I'd like someone to install a new kitchen tap.",
  },
];

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="metric">
      <div className="eyebrow">{label}</div>
      <div className="metricValue">{value}</div>
      {detail && <div className="metricDetail">{detail}</div>}
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const missing = value === "Missing";

  return (
    <div className="fieldRow">
      <span>{label}</span>
      <strong className={missing ? "missing" : ""}>
        {value}
      </strong>
    </div>
  );
}

function Pipeline({
  lead,
}: {
  lead: DemoLead;
}) {
  const hasEnquiry = lead.score > 0;
  const qualified =
    lead.postcode !== "Missing" &&
    lead.phone !== "Missing";
  const ready =
    qualified && lead.timing !== "Missing";

  return (
    <div className="pipeline">
      <PipelineStep
        number="01"
        title="ANSWER"
        description="Inbound captured"
        active={hasEnquiry}
      />
      <PipelineStep
        number="02"
        title="QUALIFY"
        description="Intent + customer data"
        active={hasEnquiry}
        complete={qualified}
      />
      <PipelineStep
        number="03"
        title="BOOK"
        description="Convert intent to action"
        active={ready}
      />
      <PipelineStep
        number="04"
        title="FOLLOW UP"
        description="Recover unfinished demand"
        active={false}
      />
      <PipelineStep
        number="05"
        title="RECOVER"
        description={
          lead.value
            ? `£${lead.value} opportunity protected`
            : "Revenue returned to pipeline"
        }
        active={lead.value > 0}
      />
    </div>
  );
}

function PipelineStep({
  number,
  title,
  description,
  active,
  complete = false,
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
        active ? "pipelineActive" : ""
      }`}
    >
      <div className="stepNumber">{number}</div>
      <div>
        <div className="stepTitle">
          {title}
          {complete && (
            <span className="check"> ✓</span>
          )}
        </div>
        <div className="stepDescription">
          {description}
        </div>
      </div>
    </div>
  );
}

export default function CommandCentre() {
  const [lead, setLead] =
    useState<DemoLead>(initialLead);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [input, setInput] = useState("");

  const completion = useMemo(() => {
    const fields = [
      lead.problem !== "Waiting for enquiry",
      lead.postcode !== "Missing",
      lead.phone !== "Missing",
      lead.timing !== "Missing",
    ];

    return Math.round(
      (fields.filter(Boolean).length /
        fields.length) *
        100
    );
  }, [lead]);

  function submitMessage(message: string) {
    const trimmed = message.trim();

    if (!trimmed) return;

    const nextLead =
      analyseDemoMessage(trimmed, lead);

    setLead(nextLead);

    setMessages((current) => [
      ...current,
      {
        role: "customer",
        text: trimmed,
      },
      {
        role: "agent",
        text: nextLead.nextQuestion,
      },
    ]);

    setInput("");
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    submitMessage(input);
  }

  function reset() {
    setLead(initialLead);
    setMessages([]);
    setInput("");
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brandLockup">
          <div className="mark">8</div>
          <div>
            <div className="brand">8LABS</div>
            <div className="productName">
              REVENUE RECOVERY
            </div>
          </div>
        </div>

        <div className="systemStatus">
          <span className="pulse" />
          LIVE SYSTEM
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
            into <span>recovered revenue.</span>
          </h1>

          <p>
            Answer. Qualify. Book. Follow up.
            Recover. One operating layer between
            customer intent and money in the bank.
          </p>
        </div>

        <div className="heroStats">
          <Metric
            label="REVENUE AT RISK"
            value={`£${lead.value}`}
            detail={
              lead.value
                ? "Current inbound opportunity"
                : "Waiting for demand"
            }
          />

          <Metric
            label="LEAD SCORE"
            value={`${lead.score}`}
            detail="/ 100"
          />

          <Metric
            label="COMPLETENESS"
            value={`${completion}%`}
            detail="Qualification state"
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
              <h2>Inbound intelligence</h2>
            </div>

            <button
              className="ghostButton"
              onClick={reset}
            >
              RESET
            </button>
          </div>

          {messages.length === 0 ? (
            <div className="emptyConversation">
              <div className="signalOrb">
                <div className="signalCore" />
              </div>

              <h3>Waiting for an enquiry.</h3>

              <p>
                Test the Revenue Engine with a
                customer message or launch one of
                the scenarios below.
              </p>

              <div className="scenarioRow">
                {scenarios.map((scenario) => (
                  <button
                    key={scenario.label}
                    onClick={() =>
                      submitMessage(
                        scenario.message
                      )
                    }
                  >
                    {scenario.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`message ${message.role}`}
                >
                  <div className="messageRole">
                    {message.role === "customer"
                      ? "CUSTOMER"
                      : "8LABS"}
                  </div>

                  <div>{message.text}</div>
                </div>
              ))}
            </div>
          )}

          <form
            className="composer"
            onSubmit={handleSubmit}
          >
            <input
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              placeholder="Type the customer's next message..."
            />

            <button type="submit">
              PROCESS →
            </button>
          </form>
        </div>

        <aside className="intelligencePanel">
          <div className="eyebrow">
            OPPORTUNITY INTELLIGENCE
          </div>

          <div
            className={`urgency urgency-${lead.urgency.toLowerCase()}`}
          >
            <span className="urgencyDot" />
            {lead.urgency}
          </div>

          <div className="money">
            £{lead.value}
          </div>

          <div className="moneyLabel">
            REVENUE AT RISK
          </div>

          <div className="scoreTrack">
            <div
              className="scoreFill"
              style={{
                width: `${lead.score}%`,
              }}
            />
          </div>

          <div className="scoreMeta">
            <span>Opportunity score</span>
            <strong>{lead.score}/100</strong>
          </div>

          <div className="actionBox">
            <div className="eyebrow">
              NEXT BEST ACTION
            </div>
            <strong>{lead.action}</strong>
          </div>

          <div className="questionBox">
            <div className="eyebrow">
              ENGINE DECISION
            </div>
            <p>{lead.nextQuestion}</p>
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
              <h2>Lead state</h2>
            </div>

            <div className="completion">
              {completion}% COMPLETE
            </div>
          </div>

          <div className="fields">
            <Field
              label="Problem"
              value={lead.problem}
            />
            <Field
              label="Postcode"
              value={lead.postcode}
            />
            <Field
              label="Phone"
              value={lead.phone}
            />
            <Field
              label="Preferred time"
              value={lead.timing}
            />
            <Field
              label="Active damage"
              value={
                lead.activeDamage
                  ? "Detected"
                  : "Not detected"
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
          8LABS / REVENUE RECOVERY ENGINE
        </div>
        <div>
          ANSWER → QUALIFY → BOOK → FOLLOW UP
          → RECOVER
        </div>
      </footer>
    </main>
  );
}
