import { RunnableConfig } from "@langchain/core/runnables";
import { AgentState } from "./constants";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { PromptTemplate } from "@langchain/core/prompts";
import { llm } from "../llm";
import {
  NODE_CYPHER_RETRIEVER,
  NODE_PORDUCTS_SEARCH,
  NODE_JOKE,
} from "./constants";

export const router = async (data: AgentState, config?: RunnableConfig) => {
  const prompt = PromptTemplate.fromTemplate(`
    You are an AI agent deciding which tool to use.

    Follow the rules below to come to your conclusion:
    * Do attempt to use your pre-trained knowledge to answer.
    * If the question relates to listing, showing or searching Ingredients, Categories, Brands or General Supplement or Products or is asking you to list or show supplements and can be answered by a database
    query, respond with "${NODE_CYPHER_RETRIEVER}".
    * If the question relates to the description of a supplement or product and can be answered with
    the contents of the supplements name or description, respond with "${NODE_PORDUCTS_SEARCH}".
    * For all other queries, respond with that does not mention suppliments or categories or brands or ingredients "${NODE_JOKE}".


    Question: {question}

    {format_instructions}
  `);

  const parser = StructuredOutputParser.fromZodSchema(
    z.enum([NODE_PORDUCTS_SEARCH, NODE_CYPHER_RETRIEVER, NODE_JOKE])
  );

  const chain = prompt.pipe(llm).pipe(parser);

  return chain.invoke({
    question: data.rephrased,
    format_instructions: parser.getFormatInstructions(),
  });
};
