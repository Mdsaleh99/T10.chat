import { id } from "date-fns/locale";
import { NextResponse } from "next/server";
import { success } from "zod";

export async function GET(req) {
  try {
    const response = await fetch(`https://openrouter.ai/api/v1/models`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch models");
    }
    const data = await response.json();
    const freeModels = data.data.filter((model) => {
      const promptPrice = parseFloat(model.pricing.prompt || "0");
      const completionPrice = parseFloat(model.pricing.completion || "0");
      return promptPrice === 0 && completionPrice === 0;
    });
      
      const formattedModels = freeModels.map((model) => ({
          id: model.id,
          name: model.name,
          description: model.description,
          context_length: model.context_length,
          architecture: model.architecture,
          pricing: model.pricing,
          top_provider: model.top_provider,
      }))

    return NextResponse.json({
      models: formattedModels,
    });
  } catch (error) {
    console.error("Error fetching free models");

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
