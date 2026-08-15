import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PopularCourses from "../PopularCourses";

vi.mock("@supabase/supabase-js", () => {
    const queryResult = Promise.resolve({ data: [], error: null });
    const builder: Record<string, unknown> = {};
    ["from", "select", "eq", "contains", "order", "limit"].forEach((method) => {
        builder[method] = vi.fn(() => builder);
    });
    builder.then = queryResult.then.bind(queryResult);
    builder.catch = queryResult.catch.bind(queryResult);
    builder.finally = queryResult.finally.bind(queryResult);

    return {
        createClient: vi.fn(() => builder),
    };
});

describe("PopularCourses", () => {
    it("renders the 'Our Courses' heading", async () => {
        render(await PopularCourses());

        expect(screen.getByRole("heading", { name: "Our Courses" })).toBeInTheDocument();
    });

    it("no longer renders the removed 'New Learnings begin' tagline", async () => {
        render(await PopularCourses());

        expect(screen.queryByText(/new learnings begin/i)).not.toBeInTheDocument();
    });

    it("falls back to mock courses when no data is returned", async () => {
        render(await PopularCourses());

        expect(screen.getByText("PMP® Certification Training")).toBeInTheDocument();
    });
});
