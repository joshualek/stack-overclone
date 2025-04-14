import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function Filters() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [sort, setSort] = useState(searchParams.get("sort") || "");
    const [tag, setTag] = useState(searchParams.get("tag") || "");

    const handleSubmit = (e) => {
        e.preventDefault();
        const query = new URLSearchParams();
        if (sort) query.set("sort", sort);
        if (tag) query.set("tag", tag);
        navigate(`/questions?${query.toString()}`);
    };

    const handleClear = () => {
        setSort("");
        setTag("");
        navigate("/questions");
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="mb-3 d-flex gap-2">
                <select
                    name="sort"
                    className="form-select"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                >
                    <option value="">---Sort By---</option>
                    <option value="recent">Most Recent</option>
                    <option value="hot">Hot</option>
                </select>
                <input
                    type="text"
                    name="tag"
                    className="form-control"
                    placeholder="Filter by tag (e.g. javascript)"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                />
                <button type="submit" className="btn btn-primary rounded-pill">
                    Apply
                </button>
            </form>

            {(sort || tag) && (
                <p className="text-muted mb-4">
                    {sort && (
                        <>
                            <strong>Sort:</strong> {sort}
                        </>
                    )}
                    {sort && tag && " | "}
                    {tag && (
                        <>
                            <strong>Tag:</strong> "{tag}"
                        </>
                    )}
                    &nbsp;
                    <button
                        type="button"
                        className="btn btn-link text-danger text-decoration-none p-0 ps-2"
                        onClick={handleClear}
                    >
                        (Clear)
                    </button>
                </p>
            )}
        </>
    );
}

export default Filters;
