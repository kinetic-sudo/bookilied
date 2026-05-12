import { MAX_FILE_SIZE } from "@/lib/constant";
import { auth } from "@clerk/nextjs/server";
import { HandleUploadBody, handleUpload } from "@vercel/blob/client";
import { error } from "console";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  
  try {
    const body = (await request.json()) as HandleUploadBody;
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const { userId } = await auth();

        if (!userId) {
          throw new Error("Unathorized: User not authenticated");
        }

        return {
          allowedContentTypes: [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp",
          ],
          addRandomSuffix: true,
          maximumSizeInBytes: MAX_FILE_SIZE,
          tokenPayload: JSON.stringify({ userId }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("File uploaded to blob:", blob.url);

        const payload = tokenPayload ? JSON.parse(tokenPayload) : null;
        const userId = payload?.userId;

        // todo: posthod
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "An unknown error occuered";
    const status = message.includes("unathorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
