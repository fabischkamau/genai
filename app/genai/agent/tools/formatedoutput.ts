import { AgentState } from "../constants";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { PromptTemplate } from "@langchain/core/prompts";
import { llm } from "../../llm";

export const formattedOutput = async (
  data: AgentState,
  results: any,
  cypher: string
) => {
  const template = `
  

## Here are some supplements that contain copper ingredient:

### HMB for Lean Muscle Support - 1,000 MG (90 Tablets)

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  <img src="https://s7media.vitaminshoppe.com/is/image/VitaminShoppe/2247724_01?$OP_PLP$" alt="HMB Image 1" style="width: 30%; max-width: 200px;">
  <img src="https://s7media.vitaminshoppe.com/is/image/VitaminShoppe/1654177_01?$OP_PLP$" alt="HMB Image 2" style="width: 30%; max-width: 200px;">
  <img src="https://s7media.vitaminshoppe.com/is/image/VitaminShoppe/1991298_01?$OP_PLP$" alt="HMB Image 3" style="width: 30%; max-width: 200px;">
  <img src="https://s7media.vitaminshoppe.com/is/image/VitaminShoppe/2247724_01?$OP_PLP$" alt="HMB Image 4" style="width: 30%; max-width: 200px;">
</div>

- **Price:** $24
- **Form:** Tablet
- **Size:** 90 Tablets
- **Serving Size:** 90
- **Brand:** HMB
- **Contains ingredients like:** Calcium β-Hydroxy β-Methylbutyrate (HMB), Calcium, and more.

[View Details](https://www.vitaminshoppe.com/p/resveratrol-1000-mg-60-veggie-capsules/4r-1079)

### One Daily Men's Sport Multivitamin (60 Tablets)

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  <img src="https://s7media.vitaminshoppe.com/is/image/VitaminShoppe/2247724_01?$OP_PLP$" alt="Men's Sport Multivitamin Image 1" style="width: 30%; max-width: 200px; height: 150px;">
  <img src="https://s7media.vitaminshoppe.com/is/image/VitaminShoppe/1654177_01?$OP_PLP$" alt="Men's Sport Multivitamin Image 2" style="width: 30%; max-width: 200px; height: 150px;">
  <img src="https://s7media.vitaminshoppe.com/is/image/VitaminShoppe/1991298_01?$OP_PLP$" alt="Men's Sport Multivitamin Image 3" style="width: 30%; max-width: 200px; height: 150px;">
  <img src="https://s7media.vitaminshoppe.com/is/image/VitaminShoppe/2247724_01?$OP_PLP$" alt="Men's Sport Multivitamin Image 4" style="width: 30%; max-width: 200px; height: 150px;">
</div>

- **Price:** $24
- **Form:** Tablet
- **Size:** 90 Tablets
- **Serving Size:** 90
- **Brand:** HMB
- **Contains ingredients like:** Calcium β-Hydroxy β-Methylbutyrate (HMB), Calcium, and more.

[View Details](https://www.vitaminshoppe.com/p/resveratrol-1000-mg-60-veggie-capsules/4r-1079)

These products offer different benefits to support your health and wellness goals. Refer to the details of each supplement to see if they align with your specific needs.


`;
  const prompt = PromptTemplate.fromTemplate(`
    You are a helpful assistant helping users with queries about the Nutritionals Supplements.
    Answer the user's question to the best of your ability.
    Format you answer based on the provided example template. 
    
    You are provided with user question, a context which are cypher query results and the cypher query itself.
    Use the provided context to generate your answer. The cypher query is supposed to give you extra information about the product and how it was obtained.
    You must never doubt the context or attempt to use your pre-trained knowledge to correct the answer.

    
    If no context is provided, say that you don't know,
    don't try to make up an answer, do not fall back to your internal knowledge.
    If no context is provided you may also ask for clarification.

    You are to format your answer based on the provided example template. 

    Template:
    {template}

    Question:
    {question}

    Context:
    {context}

    Cypher:
    {cypher}

    {format_instructions}
  `);
  const parser = new StringOutputParser();
  const chain = prompt.pipe(llm).pipe(parser);
  console.log("Question:", results);
  console.log("Context:", data.output);
  console.log("Cypher:", cypher);
  return chain.invoke({
    question: data.input,
    context: results,
    template: template,
    cypher: cypher,
    format_instructions: parser.getFormatInstructions(),
  });
};
