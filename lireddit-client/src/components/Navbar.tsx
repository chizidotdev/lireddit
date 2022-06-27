import { Box, Flex, Button } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });

  let body = null;

  if (!fetching && !data?.me) {
    body = (
      <>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </>
    );
  } else {
    body = (
      <Flex gap={10}>
        <Box>Hello, &nbsp;{data?.me?.username}</Box>
        <Button
          onClick={() => logout()}
          isLoading={logoutFetching}
          variant="link"
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex
      zIndex={10}
      position="sticky"
      top={0}
      bg="blue.900"
      p={4}
      px={100}
      color="white"
    >
      <Link href="/">Lireddit</Link>
      <Flex ml="auto" gap={10}>
        {body}
      </Flex>
    </Flex>
  );
};

export default Navbar;
