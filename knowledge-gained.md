# Knowledge Gained on The Portfolio Project

## Working on Admin Page
Tansack query is better than useeffect because it stores data between route navigations in cache until the cache is manually invalidated leading to faster performance. Willl likely need to update the premier meats demo and quilsave sites using the same.

More detail is givenin this explanation
### Why TanStack Query shines here (and why useEffect falls short)
1. Automatic Caching & Background Refetching
TanStack Query: When you switch tabs (e.g., from Projects to Messages and back), TanStack Query remembers the data. It doesn't refetch unless the data is marked as stale, keeping the UI lightning-fast. It also automatically refetches when the user refocuses the browser window.

useEffect: Every time a component unmounts and remounts (or if you change routes/tabs without proper state lifting), useEffect will trigger a fresh network request every single time, leading to unnecessary loading spinners and wasted server bandwidth.

2. Built-in Loading, Error, and Mutation States
TanStack Query: Provides clean, declarative flags out of the box like projectsQ.isLoading, projectsQ.isError, and mutation.isPending.

useEffect: You have to manually write and manage multiple state variables for every single query:

TypeScript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
Multiply that by multiple API endpoints, and your component quickly fills up with messy boilerplate.

3. Cache Invalidation & Mutations (qc.invalidateQueries)
TanStack Query: Look at how handleSave or handleDelete updates the UI:

TypeScript
qc.invalidateQueries({ queryKey: ['admin', 'projects'] });
This tells TanStack Query: "The server data changed, automatically throw away the old cache and fetch the fresh list right now." Your UI updates instantly without you manually having to stitch arrays together in state.

useEffect: You would have to manually call your fetch function again inside your mutation handlers and pass down state-setting functions or lift state up to keep everything synchronized.

When would useEffect be enough?
You can get away with useEffect if:

The app is extremely small (e.g., a single page with one API call).

You don't care about caching, race conditions, automatic retries on failure, or stale data management.

Summary Recommendation
Stick with TanStack Query (or Next.js Server Actions / Server Components, depending on your architecture). It saves you from writing dozens of lines of repetitive loading/error state logic and provides a much smoother experience for dashboard applications where data constantly changes (like creating projects or marking messages as read).

## Data Validation
Use data validation on both the frontend and the backend to prevent bad data. In nextjs if possible pull the schema's out of components into a common schema's directory where they can be shared by both parts.