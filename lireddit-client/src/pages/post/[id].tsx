import { Heading, Box, Flex } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import EditDeletePostButtons from "../../components/EditDeletePostButtons";
import { Layout } from "../../components/Layout";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";

const Post = () => {
  const router = useRouter();

  const [{ data, error, fetching }] = useGetPostFromUrl();

  if (fetching) {
    return <Layout>Loading....</Layout>;
  }

  if (error) {
    return <Layout>{error.message}</Layout>;
  }

  if (!data?.post) {
    <Layout>
      <Box>Post not found</Box>
    </Layout>;
  }

  return (
    <Layout>
      <Flex justifyContent="space-between">
        <Heading>{data?.post?.title}</Heading>
        <EditDeletePostButtons
          id={data!.post!.id}
          creatorId={data!.post!.creator.id}
        />
      </Flex>
      <Box mt={8}>{data?.post?.text}</Box>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
