import { Flex, Button, Box } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import Link from "next/link";
import router, { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useCreatePostMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { toErrorMap } from "../utils/toErrorMap";
import login from "./login";

const CreatePost: React.FC<{}> = () => {
  const [, createPost] = useCreatePostMutation();
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await createPost({ input: values });
          if (response.error) {
            setErrors({ title: response.error.message });
          } else {
            router.push("/");
          }
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
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
