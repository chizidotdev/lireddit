import { Box } from "@chakra-ui/react";
import React, { ReactNode } from "react";

export type WrapperVariant = "small" | "regular";

interface WrapperProps {
  variant?: WrapperVariant;
  children: ReactNode;
}

export const Wrapper: React.FC<WrapperProps> = ({
  children,
  variant = "regular",
}) => {
  return (
    <Box
      maxW={variant === "regular" ? "800px" : "400px"}
      mt={8}
      mx="auto"
      w="100%"
    >
      {children}
    </Box>
  );
};
