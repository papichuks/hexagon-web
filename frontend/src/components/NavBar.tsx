'use client';
import { HEXAGON_ABI } from '@/lib/hexagon';
import {
  Box,
  Flex,
  HStack,
  Link as ChakraLink,
  Button,
  Text,
  useColorModeValue,
  Container,
  IconButton,
  useColorMode,
} from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useAccount, useReadContract } from 'wagmi';

export default function NavBar() {
  const pathname = usePathname();
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { address } = useAccount();
  const { data: isManufacturer } = useReadContract({
    address: process.env.NEXT_PUBLIC_HEXAGON_ADDRESS as `0x${string}`,
    abi: HEXAGON_ABI,
    functionName: 'isManufacturer',
    args: [address as `0x${string}`],
  });

  const isActive = (path: string) => pathname === path;

  return (
    <Box
      bg={bg}
      borderBottom='1px'
      borderColor={borderColor}
      position='sticky'
      top={0}
      zIndex={1000}
    >
      <Container maxW='7xl'>
        <Flex h={16} alignItems='center' justifyContent='space-between'>
          <HStack spacing={8} alignItems='center'>
            <Link href='/' passHref>
              <Text
                fontSize='xl'
                fontWeight='bold'
                color='brand.500'
                cursor='pointer'
                _hover={{ color: 'brand.600' }}
              >
                Hexagon
              </Text>
            </Link>
            <HStack as='nav' spacing={4} display={{ base: 'none', md: 'flex' }}>
              <Link href='/verification' passHref>
                <ChakraLink
                  px={2}
                  py={1}
                  rounded='md'
                  color={
                    isActive('/verification')
                      ? 'brand.500'
                      : useColorModeValue('gray.600', 'gray.300')
                  }
                  fontWeight={isActive('/verification') ? 'semibold' : 'normal'}
                  _hover={{
                    textDecoration: 'none',
                    color: 'brand.500',
                  }}
                >
                  Verify Product
                </ChakraLink>
              </Link>
              <Link href='/product-info' passHref>
                <ChakraLink
                  px={2}
                  py={1}
                  rounded='md'
                  color={
                    isActive('/product-info')
                      ? 'brand.500'
                      : useColorModeValue('gray.600', 'gray.300')
                  }
                  fontWeight={isActive('/product-info') ? 'semibold' : 'normal'}
                  _hover={{
                    textDecoration: 'none',
                    color: 'brand.500',
                  }}
                >
                  Product Info
                </ChakraLink>
              </Link>
              <Link
                href={isManufacturer ? '/manufacturer/home' : '/manufacturer'}
                passHref
              >
                <ChakraLink
                  px={2}
                  py={1}
                  rounded='md'
                  color={
                    isActive('/manufacturer') || isActive('/manufacturer/home')
                      ? 'brand.500'
                      : useColorModeValue('gray.600', 'gray.300')
                  }
                  fontWeight={
                    isActive('/manufacturer') || isActive('/manufacturer/home')
                      ? 'semibold'
                      : 'normal'
                  }
                  _hover={{
                    textDecoration: 'none',
                    color: 'brand.500',
                  }}
                >
                  Manufacturer
                </ChakraLink>
              </Link>
            </HStack>
          </HStack>
          <HStack spacing={4}>
            <IconButton
              aria-label='Toggle color mode'
              icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
              onClick={toggleColorMode}
              variant='ghost'
              size='md'
            />
            <ConnectButton showBalance={false} />
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
