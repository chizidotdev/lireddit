import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useMeQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import Link from "next/link";
import { useState } from "react";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 33,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  if (!fetching && !data) {
    return <div>Query failed...</div>;
  }

  return (
    <Layout>
      <Button variant="link">
        <Link href="/create-post">Create Post</Link>
      </Button>
      <br />
      {data && !fetching ? (
        <Stack>
          {data.posts.posts.map((p, idx) => (
            <Box key={idx} p={5} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{p.title}</Heading>
              <Text mt={4}>{p.textSnippet}...</Text>
              {/* <Text mt={4}>{p.text.slice(0, 100)}...</Text> */}
            </Box>
          ))}
        </Stack>
      ) : (
        <div>Loading...</div>
      )}
      {data && data.posts.hasMore && (
        <Flex>
          <Button
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
            m="auto"
            my={8}
          >
            Load More
          </Button>
        </Flex>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
