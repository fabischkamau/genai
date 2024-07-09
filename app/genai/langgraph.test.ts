import { call } from ".";

describe("GenAi Test", () => {
  it("should call Generative AI", async () => {
    const res = await call(
      "Show me available products with ingerdients zinc",
      "a86267e8-bf01-464f-9053-fa6564b8ff85"
    );
    expect(res).toBeDefined();
    console.log(res);
  });
});
