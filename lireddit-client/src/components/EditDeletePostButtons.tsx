import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { IconButton, Box } from "@chakra-ui/react";
import router from "next/router";
import React from "react";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";

interface EditDeletePostButtonsProps {
  id: number;
  creatorId: number;
}

const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
  id,
  creatorId,
}) => {
  const [{ data: meData }] = useMeQuery();
  const [, deletePost] = useDeletePostMutation();
  if (meData?.me?.id !== creatorId) {
    return null;
  }
  return (
    <Box>
      <IconButton
        mr={3}
        aria-label="edit post"
        // color="red"
        icon={<EditIcon />}
        onClick={() => router.push("/post/edit/[id]", `/post/edit/${id}`)}
      />
      <IconButton
        aria-label="delete post"
        color="red"
        icon={<DeleteIcon />}
        onClick={() => deletePost({ id })}
      />
    </Box>
  );
};

export default EditDeletePostButtons;
