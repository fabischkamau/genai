import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";

// tag::function[]

const exampleCypher = `
 Example Question #1:  Which supplements have Copper ingredient?
    Example Cypher:

      CALL db.index.fulltext.queryNodes("namesAndDetails", "copper") YIELD node, score
      MATCH (node)<-[:HAS_INGREDIENT]-(s)
      WITH node.name AS ingredient, score,s, COLLECT({
          name: s.name, 
          description: s.description, 
          thumbnails: s.thumbnails, 
          form: s.form, 
          allergens: s.allergens, 
          warnings: s.warnings
      }) AS supplements
      RETURN ingredient, {supplements: supplements} AS metadata, score , elementId(s) AS _id
      ORDER BY score DESC
      LIMIT 10


    Example Question #2:  Which supplements have zinc and copper?
    Example Cypher:

    WITH ["zinc", "copper"] AS ingredients
    MATCH (i:Ingredient)<-[:HAS_INGREDIENT]-(s)
    WHERE ANY(ingredient IN ingredients WHERE i.name CONTAINS ingredient OR i.details CONTAINS ingredient)
    WITH i.name AS ingredient, s,COLLECT({name: s.name, description: s.description, thumbnails: s.thumbnails, form: s.form, allergens: s.allergens, warnings: s.warnings}) AS supplements
    RETURN ingredient, {supplements: supplements} AS metadata, elementId(s) AS _id LIMIT 10


    Example Question #3:  Which supplements are in the brand Natural Factors?
    Example Cypher:

    CALL db.index.fulltext.queryNodes("brandNames", "Natural Factors") YIELD node,score
    MATCH (node)<-[:IN_BRAND]-(s)
    WITH node.name AS ingredient, score,s, COLLECT({
        name: s.name, 
        description: s.description, 
        thumbnails: s.thumbnails, 
        form: s.form, 
        allergens: s.allergens, 
        warnings: s.warnings
    }) AS supplements
    RETURN ingredient, {supplements: supplements} AS metadata, score , elementId(s) AS _id
    ORDER BY score DESC
    LIMIT 10


    Example Question #4:  Which supplements are in category Vitamins?
    Example Cypher:

    CALL db.index.fulltext.queryNodes("categoryNames", "Vitamins") YIELD node,score
    MATCH (node)<-[:IN_CATEGORY]-(s)
    WITH node.name AS ingredient, score,s, COLLECT({
        name: s.name, 
        description: s.description, 
        thumbnails: s.thumbnails, 
        form: s.form, 
        allergens: s.allergens, 
        warnings: s.warnings
    }) AS supplements
    RETURN ingredient, {supplements: supplements} AS metadata, score , elementId(s) AS _id
    ORDER BY score DESC
    LIMIT 10
`;
export default async function initCypherGenerationChain(
  graph: Neo4jGraph,
  llm: BaseLanguageModel
) {
  // tag::prompt[]
  // Create Prompt Template
  const cypherPrompt = PromptTemplate.fromTemplate(`
    You are a Neo4j Developer translating user questions into Cypher to answer questions
    about products or suppliments with their  ingredients ,categories and brands.

    Convert the user's question into a Cypher statement based on the schema.
    You will be provided with database indexes to help you generate better cypher statements when needed especially for string similarities using FULLTEXT SEARCH.

    You must:
    * Only use the nodes, relationships and properties mentioned in the schema.
    * When required, \`IS NOT NULL\` to check for property existence, and not the exists() function.
    * Use the \`elementId()\` function to return the unique identifier for a node or relationship as \`_id\`.
      For example:

      MATCH (s:Supplement)-[:HAS_INGREDIENT]->(i:Ingredient)
      WHERE s.name = "Glucosamine, Chondroitin, & MSM - Supports Joint Health, Mobility, & Flexibility - Raspberry (120 Chewable Tablets)"
      RETURN m.name AS name, elementId(s) AS _id, a.description AS description, a.thumbnails AS thumbnails

    * Include extra information about the nodes that may help an LLM provide a more informative answer,
      for example the release thumbnails, price, allergens or warnings.
    * Limit the maximum number of results to 10.
    * Respond with only a Cypher statement.  No preamble.

    You will be provided with examples of cypher statement for fulltext search.
    Examples:
    {exampleCypher}

    Schema:
    {schema}

    Indexes:
    {indexes}

    Question:
    {question}
  `);
  // end::prompt[]

  // tag::sequence[]
  // tag::startsequence[]
  // Create the runnable sequence
  return RunnableSequence.from<string, string>([
    // end::startsequence[]
    // tag::assign[]
    {
      // Take the input and assign it to the question key
      question: new RunnablePassthrough(),
      // Get the schema
      schema: () => graph.getSchema(),
      // Get the indexes
      indexes: () => graph.query("SHOW INDEXES"),
      // Get the example cypher
      exampleCypher: () => exampleCypher,
    },
    // end::assign[]
    // tag::rest[]
    cypherPrompt,
    llm,
    new StringOutputParser(),
    // end::rest[]
    // tag::endsequence[]
  ]);
  // end::endsequence[]
  // end::sequence[]
}
// end::function[]
