import { withUrqlClient } from "next-urql";
import { Navbar } from "../components/Navbar";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [{ data }] = usePostsQuery();

  return (
    <div>
      <Navbar />

      <h1>Hello World</h1>
      <br />
      {data ? data.posts.map((p) => <div key={p.id}>{p.title}</div>) : null}
    </div>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
