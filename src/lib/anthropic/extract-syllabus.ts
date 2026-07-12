import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import {
  SYLLABUS_EXTRACTION_TOOL,
  syllabusExtractionSchema,
  type SyllabusExtraction,
} from "./schema";

const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY — server-only, never exposed to the client

export const SYLLABUS_MODEL =
  process.env.ANTHROPIC_SYLLABUS_MODEL ?? "claude-opus-4-8";

export async function extractSyllabus(pdfBase64: string): Promise<SyllabusExtraction> {
  console.log(
    `[extractSyllabus] calling Anthropic model=${SYLLABUS_MODEL} pdfBytes=${Math.round((pdfBase64.length * 3) / 4)}`,
  );

  // Streamed rather than a single blocking call: a large PDF plus adaptive
  // thinking can go a while with no bytes in flight, which is exactly what
  // trips idle-connection resets on proxies/AV between here and Anthropic
  // (this is what caused the earlier ECONNRESET) — streaming keeps data
  // flowing throughout the request.
  let response;
  try {
    const stream = anthropic.messages.stream({
      model: SYLLABUS_MODEL,
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      tools: [SYLLABUS_EXTRACTION_TOOL],
      tool_choice: { type: "tool", name: "record_syllabus_extraction" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
            },
            {
              type: "text",
              text: "Extract the course schedule, calendar dates, and assignments from this syllabus.",
            },
          ],
        },
      ],
    });
    response = await stream.finalMessage();
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.error(
        `[extractSyllabus] Anthropic API error: status=${err.status} name=${err.name} message=${err.message}`,
        err.error,
      );
    } else {
      console.error("[extractSyllabus] unexpected error calling Anthropic:", err);
    }
    throw err;
  }

  console.log(
    `[extractSyllabus] response stop_reason=${response.stop_reason} usage=${JSON.stringify(response.usage)} blocks=${response.content.map((b) => b.type).join(",")}`,
  );

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    console.error("[extractSyllabus] no tool_use block in response:", JSON.stringify(response.content));
    throw new Error("Claude did not return the expected structured extraction.");
  }

  // Defense in depth even with strict + forced tool_choice.
  const parsed = syllabusExtractionSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    console.error(
      "[extractSyllabus] tool input failed schema validation:",
      JSON.stringify(parsed.error.issues),
      "raw input:",
      JSON.stringify(toolUse.input),
    );
    throw new Error("Claude's extraction did not match the expected shape.");
  }

  console.log(
    `[extractSyllabus] parsed OK: schedule=${parsed.data.schedule.length} events=${parsed.data.events.length} tasks=${parsed.data.tasks.length}`,
  );
  return parsed.data;
}
