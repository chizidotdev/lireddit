import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { useDeletePostMutation, usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { Layout } from "../components/Layout";
import NextLink from "next/link";
import { useState } from "react";
import { UpdootSection } from "../components/UpdootSection";
import { DeleteIcon } from "@chakra-ui/icons";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });
  const [, deletePost] = useDeletePostMutation();

  if (!fetching && !data) {
    return <div>Query failed...</div>;
  }

  return (
    <Layout>
      <Button variant="NextLink">
        <Button mb={10}>
          <NextLink href="/create-post">Create Post</NextLink>
        </Button>
      </Button>
      <br />
      {data && !fetching ? (
        <Stack>
          {data.posts.posts.map((p) =>
            !p ? null : (
              <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
                <UpdootSection post={p} />
                <Box flex={1}>
                  <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                    <Link>
                      <Heading fontSize="xl">{p.title}</Heading>
                    </Link>
                  </NextLink>
                  <Flex justifyContent="space-between">
                    <Text mt={4}>posted by: {p.creator.username}</Text>
                    <IconButton
                      aria-label="delete post"
                      color="red"
                      icon={<DeleteIcon />}
                      onClick={() => deletePost({ id: p.id })}
                    />
                  </Flex>
                  <Text mt={4}>{p.textSnippet}</Text>
                </Box>
                {/* <Text mt={4}>{p.text.slice(0, 100)}...</Text> */}
              </Flex>
            )
          )}
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
