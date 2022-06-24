import { Box } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { Navbar } from "../components/Navbar";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [{ data }] = usePostsQuery();

  return (
    <>
      <Navbar />

      <h1>Hello World</h1>
      <br />
      {data
        ? data.posts.map((p) => (
            <Box my={4} key={p.id}>
              <h1>{p.title}</h1>
              <p>{p.text}</p>
            </Box>
          ))
        : null}
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
