import { call } from ".";

describe("GenAi Test", () => {
  it("should call Generative AI", async () => {
    const res = await call(
      "List some suppliments that are available",
      "a86267e8-bf01-464f-9053-fa6564b8ff85"
    );
    expect(res).toBeDefined();
    console.log(res);
  });
});
