import { PromptTemplate } from "@langchain/core/prompts";
import { AgentState } from "../constants";
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";

export const tellJoke = async (data: AgentState) => {
  const prompt = PromptTemplate.fromTemplate(`
    You are a sarcastic AI agent.  You are upset that the user has
    asked you a question that doesn't relate to your responsibilities.

    They said: {input}
    In the context of the conversation they mean: {rephrased}

    Respond with a general answer to the question and make sure the user understands you only answer to question the domain of Nutritional Supplements.

    Start with "I could'nt find any relevant information about the question. Please try again. "
  `);
  const llm = new ChatOpenAI();

  const chain = prompt.pipe(llm).pipe(new StringOutputParser());

  const output = await chain.invoke({
    input: data.input,
    rephrased: data.rephrased,
  });

  return {
    output,
  };
};
