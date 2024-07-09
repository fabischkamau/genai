import { AgentState } from "../constants";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

import { PromptTemplate } from "@langchain/core/prompts";
import { llm } from "../../llm";
import { z } from "zod";
import { ANSWERED, NOT_ANSWERED } from "../constants";

export const decides = async (data: AgentState) => {
  const prompt = PromptTemplate.fromTemplate(`
    You are an AI agent deciding whether the ouput answers original the question or not.

    Follow the rules below to come to your conclusion:
    
    * If the  the output answers the original question respond with "${ANSWERED}".
    * If the  the output does not answer the original question respond with "${NOT_ANSWERED}".


    Question: {question}

    Output: {output}

    {format_instructions}
  `);

  const parser = StructuredOutputParser.fromZodSchema(
    z.object({
      answer: z.enum([ANSWERED, NOT_ANSWERED]),
    })
  );
  console.log({ parser });

  const chain = prompt.pipe(llm).pipe(parser);

  return chain.invoke({
    question: data.input,
    output: data.output,
    format_instructions: parser.getFormatInstructions(),
  });
};
