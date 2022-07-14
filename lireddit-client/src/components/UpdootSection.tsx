import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [, vote] = useVoteMutation();
  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      justifyContent="space-evenly"
      mr={10}
    >
      <IconButton
        onClick={() => {
          if (post.voteStatus === 1) return;
          vote({ postId: post.id, value: 1 });
        }}
        aria-label="updoot post"
        icon={<ChevronUpIcon />}
        colorScheme={post.voteStatus === 1 ? "teal" : undefined}
      />
      {post.points}
      <IconButton
        onClick={() => {
          if (post.voteStatus === -1) return;
          vote({ postId: post.id, value: -1 });
        }}
        aria-label="downdoot post"
        icon={<ChevronDownIcon />}
        colorScheme={post.voteStatus === -1 ? "red" : undefined}
      />
    </Flex>
  );
};
