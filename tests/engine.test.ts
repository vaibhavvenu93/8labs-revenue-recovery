import {
  describe,
  expect,
  it
} from "vitest";

import {
  createPlumbingLead,
  processPlumbingMessage
} from "../packages/core/engine";


describe(
  "8Labs Revenue Recovery Engine",
  () => {

    it(
      "creates a new plumbing lead",
      () => {
        const lead =
          createPlumbingLead(
            "lead-001",
            "phone"
          );

        expect(lead.vertical)
          .toBe("plumber");

        expect(lead.stage)
          .toBe("new");

        expect(lead.action)
          .toBe("continue");

        expect(
          lead.conversation.nextQuestion
        ).toBe(
          "What problem are you experiencing?"
        );
      }
    );


    it(
      "recognises active flooding and protects revenue",
      () => {
        let lead =
          createPlumbingLead(
            "lead-002"
          );

        lead =
          processPlumbingMessage(
            lead,
            {
              message:
                "A pipe has burst and water is coming through the ceiling",
              postcode:
                "SW18 2AB",
              phone:
                "07700900123"
            }
          );

        expect(lead.urgency)
          .toBe("emergency");

        expect(lead.action)
          .toBe("call_now");

        expect(
          lead.job.activeDamage
        ).toBe(true);

        expect(
          lead.commercial.revenueAtRiskGBP
        ).toBe(300);
      }
    );


    it(
      "knows what information is missing",
      () => {
        let lead =
          createPlumbingLead(
            "lead-003"
          );

        lead =
          processPlumbingMessage(
            lead,
            {
              message:
                "My boiler is broken and I have no heating"
            }
          );

        expect(lead.urgency)
          .toBe("urgent");

        expect(
          lead.conversation.nextQuestion
        ).toBe(
          "What is the postcode where you need help?"
        );

        expect(lead.stage)
          .toBe("qualifying");
      }
    );


    it(
      "builds the lead across multiple turns",
      () => {
        let lead =
          createPlumbingLead(
            "lead-004"
          );

        lead =
          processPlumbingMessage(
            lead,
            {
              message:
                "My boiler is broken"
            }
          );

        lead =
          processPlumbingMessage(
            lead,
            {
              message:
                "I am in Manchester",
              postcode:
                "M20 4BX"
            }
          );

        lead =
          processPlumbingMessage(
            lead,
            {
              message:
                "There is no active leak"
            }
          );

        lead.job.activeDamage =
          false;

        lead =
          processPlumbingMessage(
            lead,
            {
              message:
                "My number is 07700900123",
              phone:
                "07700900123"
            }
          );

        lead =
          processPlumbingMessage(
            lead,
            {
              message:
                "My name is Sarah",
              name:
                "Sarah"
            }
          );

        lead =
          processPlumbingMessage(
            lead,
            {
              message:
                "Tomorrow morning please",
              preferredTime:
                "tomorrow morning"
            }
          );

        expect(lead.customer.name)
          .toBe("Sarah");

        expect(lead.customer.postcode)
          .toBe("M20 4BX");

        expect(lead.customer.phone)
          .toBe("07700900123");

        expect(
          lead.job.preferredTime
        ).toBe("tomorrow morning");

        expect(
          lead.conversation.nextQuestion
        ).toBeUndefined();

        expect(lead.stage)
          .toBe("ready_to_book");

        expect(lead.action)
          .toBe("book");
      }
    );


    it(
      "escalates gas emergencies instead of continuing sales qualification",
      () => {
        let lead =
          createPlumbingLead(
            "lead-005"
          );

        lead =
          processPlumbingMessage(
            lead,
            {
              message:
                "I can smell gas near the boiler"
            }
          );

        expect(
          lead.safety.emergencyServicesRequired
        ).toBe(true);

        expect(lead.stage)
          .toBe("escalated");

        expect(lead.action)
          .toBe(
            "emergency_services"
          );

        expect(
          lead.conversation.nextQuestion
        ).toBeUndefined();
      }
    );

  }
);
