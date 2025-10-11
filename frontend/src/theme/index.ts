import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const colors = {
  brand: {
    50: '#e6f3ff',
    100: '#b3d9ff',
    200: '#80bfff',
    300: '#4da6ff',
    400: '#1a8cff',
    500: '#0073e6',
    600: '#005bb3',
    700: '#004280',
    800: '#002a4d',
    900: '#00111a',
  },
  gray: {
    50: '#f7fafc',
    100: '#edf2f7',
    200: '#e2e8f0',
    300: '#cbd5e0',
    400: '#a0aec0',
    500: '#718096',
    600: '#4a5568',
    700: '#2d3748',
    800: '#1a202c',
    900: '#171923',
  },
};

const fonts = {
  heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
  body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
};

const styles = {
  global: (props: any) => ({
    body: {
      fontFamily: 'body',
      bg: props.colorMode === 'dark' ? 'gray.900' : 'white',
      color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800',
      lineHeight: 'base',
    },
    '*::placeholder': {
      color: props.colorMode === 'dark' ? 'gray.400' : 'gray.500',
    },
    '*, *::before, &::after': {
      borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
    },
  }),
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: '600',
      borderRadius: 'md',
    },
    variants: {
      solid: (props: any) => ({
        bg: props.colorMode === 'dark' ? 'brand.400' : 'brand.500',
        color: 'white',
        _hover: {
          bg: props.colorMode === 'dark' ? 'brand.300' : 'brand.600',
          transform: 'translateY(-1px)',
          boxShadow: 'lg',
        },
        _active: {
          transform: 'translateY(0)',
        },
        transition: 'all 0.2s',
      }),
      outline: (props: any) => ({
        borderColor: props.colorMode === 'dark' ? 'brand.400' : 'brand.500',
        color: props.colorMode === 'dark' ? 'brand.400' : 'brand.500',
        _hover: {
          bg: props.colorMode === 'dark' ? 'brand.400' : 'brand.500',
          color: 'white',
          transform: 'translateY(-1px)',
          boxShadow: 'lg',
        },
        _active: {
          transform: 'translateY(0)',
        },
        transition: 'all 0.2s',
      }),
    },
  },
  Card: {
    baseStyle: (props: any) => ({
      container: {
        borderRadius: 'lg',
        boxShadow: props.colorMode === 'dark' ? 'dark-lg' : 'sm',
        bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
        borderWidth: '1px',
        borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
        _hover: {
          boxShadow: props.colorMode === 'dark' ? 'dark-lg' : 'md',
          transform: 'translateY(-2px)',
        },
        transition: 'all 0.2s',
      },
    }),
  },
  Alert: {
    baseStyle: (props: any) => ({
      container: {
        // Do not force background here; let variant (e.g., 'solid') style it
        bg: 'inherit',
        borderRadius: 'md',
      },
    }),
  },
  Input: {
    variants: {
      outline: (props: any) => ({
        field: {
          bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
          borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.300',
          _hover: {
            borderColor: props.colorMode === 'dark' ? 'gray.500' : 'gray.400',
          },
          _focus: {
            borderColor: props.colorMode === 'dark' ? 'brand.400' : 'brand.500',
            boxShadow: `0 0 0 1px ${
              props.colorMode === 'dark' ? '#1a8cff' : '#0073e6'
            }`,
          },
        },
      }),
    },
  },
  Container: {
    baseStyle: {
      maxW: '7xl',
    },
  },
};

const theme = extendTheme({
  config,
  colors,
  fonts,
  styles,
  components,
});

export default theme;
