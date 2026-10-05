import {
  NextRequest,
  NextResponse
} from "next/server";

import {
  createPlumbingLead,
  processPlumbingMessage
} from "../../../../../../packages/core/engine";

import type {
  RevenueLead
} from "../../../../../../packages/core/types";

import {
  adaptWebMessage
} from "../../../lib/web-adapter";

type LeadRequest = {
  lead?: RevenueLead;
  message?: string;
  reset?: boolean;
};

export async function GET() {
  const lead =
    createPlumbingLead(
      crypto.randomUUID(),
      "web"
    );

  return NextResponse.json({
    lead
  });
}

export async function POST(
  request: NextRequest
) {
  const body =
    (await request.json()) as LeadRequest;

  if (body.reset) {
    const lead =
      createPlumbingLead(
        crypto.randomUUID(),
        "web"
      );

    return NextResponse.json({
      lead
    });
  }

  const message =
    body.message?.trim();

  if (!message) {
    return NextResponse.json(
      {
        error:
          "A customer message is required."
      },
      {
        status: 400
      }
    );
  }

  const currentLead =
    body.lead ??
    createPlumbingLead(
      crypto.randomUUID(),
      "web"
    );

  const input =
    adaptWebMessage(
      currentLead,
      message
    );

  const lead =
    processPlumbingMessage(
      currentLead,
      input
    );

  return NextResponse.json({
    lead
  });
}

