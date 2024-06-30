import { RunnableConfig } from "@langchain/core/runnables";
import { AgentState } from "./constants";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { NODE_DATABASE_QUERY, PRODUCTS_RETRIEVER } from "./constants";

export const router = async (data: AgentState, config?: RunnableConfig) => {
  const prompt = PromptTemplate.fromTemplate(`
    You are an AI agent deciding which tool to use.

    Follow the rules below to come to your conclusion:

    * If the question relates to the description  of a product and can be answered with
    the contents of the product name or description, respond with "${PRODUCTS_RETRIEVER}"
    * If the question relates to products, categories or brand or ingredients and can be answered by a database
    query, respond with "${NODE_DATABASE_QUERY}".
    Question: {question}

    {format_instructions}
  `);
  const llm = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
  const parser = StructuredOutputParser.fromZodSchema(
    z.enum([PRODUCTS_RETRIEVER, NODE_DATABASE_QUERY])
  );

  const chain = prompt.pipe(llm).pipe(parser);

  return chain.invoke({
    question: data.rephrased,
    format_instructions: parser.getFormatInstructions(),
  });
};
