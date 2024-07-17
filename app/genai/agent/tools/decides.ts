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
    * Do attempt to use your pre-trained knowledge to answer.
    * Expect the output to be markdown containing answers to the original question.
    * Do not include any explanations in your answer.
    * Strictly follow the format listed below to provide you answer.
    * If the  the output contains answers to the original question respond with "${ANSWERED}".
    * If the  the output does not contain answers to the original question respond with "${NOT_ANSWERED}".


    Question: {question}

    Output: {output}
    Strictly follow the following formated instructions to answer:
    {format_instructions}

    incase insturctions are not clear, respond with this format:
    {{answer:"should be yes or no"}}
  `);

  const parser = StructuredOutputParser.fromZodSchema(
    z.object({
      answer: z.enum([ANSWERED, NOT_ANSWERED]),
    })
  );

  const chain = prompt.pipe(llm).pipe(parser);
  console.log("Output:", data.output);
  return chain.invoke({
    question: data.input,
    output: data.output,
    format_instructions: parser.getFormatInstructions(),
  });
};
