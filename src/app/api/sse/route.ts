// /api/sse.ts
export async function POST(req: Request) {  
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const responseText = "I'd be happy to help with your project! Could you tell me more about what kind of project you're working on? Is it a design project, writing, coding, or something else?";
      
      for (const char of responseText) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ content: char })}\n\n`)
        );
        await new Promise(resolve => setTimeout(resolve, 30));
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  });
}