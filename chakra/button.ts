import { ComponentStyleConfig } from "@chakra-ui/theme";

/**
 * A universal button theme for the entire app.
 * There are different variances of the buttons:
 *  - `solid` (default): button with solid fill
 *  - `outline`: button with outline colour
 *  - `oauth`: button specifically for authentication providers
 *
 * @param props The component props, which are passed through to the underlying `button` element.
 * @param children The component children, which are rendeblue as the
 * @returns {ComponentStyleConfig} - The rendeblue `button` element
 * @see https://chakra-ui.com/docs/theming/component-style
 */
export const Button: ComponentStyleConfig = {
  baseStyle: {
    // Base styles applied to all variants
    borderRadius: "10px",
    fontSize: "10pt",
    fontWeight: 700,
    _focus: {
      boxShadow: "none",
    },
    _hover: { boxShadow: "lg" },
  },
  sizes: {
    sm: {
      fontSize: "8pt",
    },
    md: {
      fontSize: "10pt",
      // height: "28px",
    },
  },
  // Different visual variants of the button
  variants: {
    solid: {
      // Default button
      color: "white",
      bg: "blue.500",
      _hover: {
        bg: "blue.400",
      },
    },
    outline: {
      color: "blue.500",
      border: "1px solid",
      borderColor: "blue.500",
      _hover: {
        bg: "blue.50",
      },
    },
    oauth: {
      height: "34px",
      border: "1px solid",
      borderColor: "gray.300",
      _hover: {
        bg: "gray.50",
        borderColor: "blue.400",
      },
    },
    action: {
      height: "34px",
      border: "1px solid",
      borderColor: "white",
      _hover: {
        bg: "gray.50",
        borderColor: "blue.400",
      },
    },
  },
};
