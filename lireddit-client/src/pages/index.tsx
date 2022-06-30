import { Box, Button } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useMeQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import Link from "next/link";

const Index = () => {
  const [{ data }] = usePostsQuery({
    variables: { limit: 10 },
  });

  return (
    <Layout>
      <Button variant="link">
        <Link href="/create-post">Create Post</Link>
      </Button>
      <br />
      {data
        ? data.posts.map((p) => (
            <Box my={4} key={p.id}>
              <h1>{p.title}</h1>
              <p>{p.text}</p>
            </Box>
          ))
        : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
