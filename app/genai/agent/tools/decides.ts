import { AgentState } from "../constants";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

import { PromptTemplate } from "@langchain/core/prompts";
import { llm } from "../../llm";

export const decides = async (data: AgentState) => {
    console.log("Choosing another tool")
  const prompt = PromptTemplate.fromTemplate(`
    You are an AI agent deciding whether the ouput answers the question or not.

    Follow the rules below to come to your conclusion:
    
    * Do these results answer the original question? Answer with the format provided.


    Question: {question}

    Answer: {output}

    {format_instructions}
  `);

  const parser = StructuredOutputParser.fromNamesAndDescriptions({
    answer: "should be yes or no answer",
  });

  const chain = prompt.pipe(llm).pipe(parser);

  return chain.invoke({
    question: data.input,
    output: data.output,
    format_instructions: parser.getFormatInstructions(),
  });
};
