import { initGraph } from "./graph";

describe("Test Database Connection", () => {
  describe("Get Schema", () => {
    it("Query Graph Schema", async () => {
      const graph = await initGraph();
      const schema = await graph.getSchema();
      console.log(schema);
    });
  });
  describe("Get Indexes", () => {
    it("Query Graph Indexes", async () => {
      const graph = await initGraph();
      const indexes = await graph.query("SHOW INDEXES");
      console.log(indexes);
    });
  });
});
