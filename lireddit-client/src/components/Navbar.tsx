import { Box, Flex, Button } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";
import { useMeQuery } from "../generated/graphql";

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery();
  let body = null;

  if (fetching) {
  } else if (!data?.me) {
    body = (
      <>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </>
    );
  } else {
    body = (
      <Flex gap={10}>
        <Box>Hello, &nbsp;{data.me.username}</Box>
        <Button variant="link">Logout</Button>
      </Flex>
    );
  }

  return (
    <Flex bg="blue.900" p={4} px={100}>
      <Flex ml="auto" gap={10} color="white">
        {body}
      </Flex>
    </Flex>
  );
};
