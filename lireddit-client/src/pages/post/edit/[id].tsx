import { Box, Button, Flex } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import { useUpdatePostMutation } from "../../../generated/graphql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useGetIntId } from "../../../utils/useGetIntId";
import { useGetPostFromUrl } from "../../../utils/useGetPostFromUrl";

const EditPost = () => {
  const router = useRouter();
  const intId = useGetIntId();
  const [{ data, fetching }] = useGetPostFromUrl();
  const [, updatePost] = useUpdatePostMutation();

  if (fetching) {
    return <Layout>Loading...</Layout>;
  }

  return (
    <Layout variant="small">
      <Formik
        initialValues={{
          title: data?.post?.title as string,
          text: data?.post?.text as string,
        }}
        onSubmit={async (values, { setErrors }) => {
          await updatePost({ id: intId, ...values });
          router.back();
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" placeholder="title" label="Title" />
            <Box my={4}>
              <InputField
                textarea
                name="text"
                placeholder="description"
                label="Description"
              />
            </Box>
            <Flex gap={1} justifyContent="space-between">
              <Button color="teal" type="submit" isLoading={isSubmitting}>
                Create Post
              </Button>
            </Flex>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(EditPost);
