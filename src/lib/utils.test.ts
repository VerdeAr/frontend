import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
	it("junta classes e ignora valores falsos", () => {
		const ativo = false;

		expect(cn("flex", ativo && "hidden", null, undefined, "gap-2")).toBe(
			"flex gap-2",
		);
	});

	it("aceita objetos e listas", () => {
		expect(cn({ "font-bold": true, italic: false })).toBe("font-bold");
		expect(cn(["p-2", "m-2"])).toBe("p-2 m-2");
	});

	it("resolve conflitos do Tailwind mantendo a última classe", () => {
		expect(cn("p-2", "p-4")).toBe("p-4");
		expect(cn("text-sm text-red-500", "text-lg")).toBe("text-red-500 text-lg");
	});
});
