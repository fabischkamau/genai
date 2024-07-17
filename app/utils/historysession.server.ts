import { Neo4jGraph } from "@langchain/community/graphs/neo4j_graph";

let graph: Neo4jGraph;

export async function initGraph(): Promise<Neo4jGraph> {
  if (!graph) {
    // Create singleton and wait for connection to be verified
    graph = await Neo4jGraph.initialize({
      url: process.env.NEO4J_URI as string,
      username: process.env.NEO4J_USERNAME as string,
      password: process.env.NEO4J_PASSWORD as string,
      database: process.env.NEO4J_DATABASE as string | undefined,
    });
  }
  return graph;
}

export const createSession = async (email?: string): Promise<string> => {
  const graph = await initGraph();

  if (email) {
    const res = await graph.query<{ id: string }>(
      `MATCH (u:User {email: $email})
      CREATE (s:Session {id:randomUUID()})
      CREATE (s)-[:HAS_USER]->(u)
      RETURN s.id AS id`,
      {
        email,
      },
      "WRITE"
    );
    return res && res.length ? res[0].id : "";
  }
  const res = await graph.query<{ id: string }>(
    `CREATE (s:Session {id:randomUUID()}) RETURN s.id AS id`
  );
  return res && res.length ? res[0].id : "";
};

export const createUser = async (
  email: string,
  name: string,
  avatar: string | null
): Promise<string> => {
  const graph = await initGraph();

  const res = await graph.query<{ email: string }>(
    `MERGE (u:User {email: $email, name: $name, avatar: $avatar}) RETURN u.email AS email`,
    {
      email,
      name,
      avatar,
    },
    "WRITE"
  );
  return res[0].email;
};

export const getUser = async (
  email: string
): Promise<{ email: string; name: string; avatar: string }> => {
  const graph = await initGraph();

  const res = await graph.query<{
    email: string;
    name: string;
    avatar: string;
  }>(
    `MATCH (u:User {email: $email}) RETURN u.email AS email , u.name AS name, u.avatar AS avatar`,
    {
      email,
    },
    "READ"
  );
  return res[0];
};

export const getHistoryMessages = async (
  email: string
): Promise<{ sessionId: string; createdAt: string; input: string }[]> => {
  const graph = await initGraph();
  const res = await graph.query<{
    sessionId: string;
    createdAt: string;
    input: string;
  }>(
    `
MATCH (:User {email: $email})<-[:HAS_USER]-(s:Session)-[:HAS_RESPONSE]->(r)
WITH s, r
ORDER BY r.createdAt DESC // Assuming 'timestamp' is an attribute that indicates the order of responses
WITH s, COLLECT(r) AS responses
RETURN s.id AS sessionId, toString(HEAD(responses).createdAt) AS createdAt, HEAD(responses).input AS input
`,
    {
      email,
    },
    "READ"
  );
  return res;
};
