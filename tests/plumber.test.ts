import { describe, expect, it } from "vitest";
import { qualifyPlumbingLead } from "../packages/qualification/plumber";

describe("8Labs Plumbing Revenue Recovery", () => {
  it("detects an emergency lead", () => {
    const result = qualifyPlumbingLead(
      "My pipe has burst and there is water everywhere",
      "SW18 2AB",
      "07700900123"
    );

    expect(result.urgency).toBe("emergency");
    expect(result.score).toBe(100);
    expect(result.recommendedAction).toBe("call_now");
  });

  it("detects an urgent boiler lead", () => {
    const result = qualifyPlumbingLead(
      "Our boiler is broken and we have no heating",
      "M20 4BX",
      "07700900123"
    );

    expect(result.urgency).toBe("urgent");
    expect(result.recommendedAction).toBe("book");
  });

  it("asks for missing customer information", () => {
    const result = qualifyPlumbingLead(
      "I have a leaking radiator"
    );

    expect(result.missingInformation).toContain("postcode");
    expect(result.missingInformation).toContain("phone");
    expect(result.recommendedAction).toBe("follow_up");
  });

  it("handles routine enquiries", () => {
    const result = qualifyPlumbingLead(
      "I'd like a new tap installed",
      "LS1 4DY",
      "07700900123"
    );

    expect(result.urgency).toBe("routine");
    expect(result.score).toBe(50);
    expect(result.recommendedAction).toBe("book");
  });
});
