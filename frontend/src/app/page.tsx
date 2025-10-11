'use client';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Grid,
  GridItem,
  Card,
  CardBody,
  Icon,
  Badge,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';
import {
  FiShield,
  FiCheck,
  FiPackage,
  FiUsers,
  FiTrendingUp,
  FiGlobe,
} from 'react-icons/fi';

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => {
  const iconBg = useColorModeValue('brand.50', 'brand.900');
  const iconColor = useColorModeValue('brand.500', 'brand.400');
  const titleColor = useColorModeValue('gray.800', 'gray.100');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Card
      height='100%'
      _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
      transition='all 0.3s'
    >
      <CardBody>
        <VStack spacing={4} align='start'>
          <Box p={3} bg={iconBg} borderRadius='lg'>
            <Icon as={icon} boxSize={6} color={iconColor} />
          </Box>
          <Heading size='md' color={titleColor}>
            {title}
          </Heading>
          <Text color={textColor} lineHeight='1.6'>
            {description}
          </Text>
        </VStack>
      </CardBody>
    </Card>
  );
};

const StatCard = ({ number, label }: { number: string; label: string }) => {
  const numberColor = useColorModeValue('brand.500', 'brand.400');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <VStack spacing={2}>
      <Heading size='2xl' color={numberColor}>
        {number}
      </Heading>
      <Text color={textColor} textAlign='center'>
        {label}
      </Text>
    </VStack>
  );
};

export default function HomePage() {
  const bgGradient = useColorModeValue(
    'linear(to-r, brand.500, brand.600)',
    'linear(to-r, brand.400, brand.500)'
  );
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Box>
      {/* Hero Section */}
      <Box bgGradient={bgGradient} color='white' py={20}>
        <Container maxW='7xl'>
          <Grid
            templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
            gap={12}
            alignItems='center'
          >
            <GridItem>
              <VStack spacing={6} align='start'>
                <Badge
                  colorScheme='blue'
                  variant='solid'
                  px={3}
                  py={1}
                  borderRadius='full'
                >
                  Powered by Hedera Testnet
                </Badge>
                <Heading size='3xl' lineHeight='1.2'>
                  Secure Pharmaceutical
                  <Text as='span' display='block' color='blue.200'>
                    Verification Platform
                  </Text>
                </Heading>
                <Text fontSize='xl' opacity={0.9} maxW='500px'>
                  A trust layer for pharmaceuticals. Register products on-chain,
                  generate secure codes for packaging, and let customers verify
                  authenticity instantly on the Hedera Testnet.
                </Text>
                <HStack spacing={4} pt={4}>
                  <Button
                    as={Link}
                    href='/verification'
                    size='lg'
                    bg='white'
                    color='blue.500'
                    _hover={{ bg: 'gray.100', transform: 'translateY(-2px)' }}
                    leftIcon={<Icon as={FiShield} />}
                  >
                    Verify Product
                  </Button>
                  <Button
                    as={Link}
                    href='/manufacturer'
                    size='lg'
                    variant='outline'
                    borderColor='white'
                    color='white'
                    _hover={{
                      bg: 'whiteAlpha.200',
                      transform: 'translateY(-2px)',
                    }}
                    leftIcon={<Icon as={FiPackage} />}
                  >
                    I'm a Manufacturer
                  </Button>
                </HStack>
              </VStack>
            </GridItem>
            <GridItem display={{ base: 'none', lg: 'block' }}>
              <Box
                bg='whiteAlpha.200'
                borderRadius='2xl'
                p={8}
                backdropFilter='blur(10px)'
                border='1px solid'
                borderColor='whiteAlpha.300'
              >
                <VStack spacing={4}>
                  <Icon as={FiShield} boxSize={16} color='white' />
                  <Heading size='lg' textAlign='center'>
                    Blockchain-Verified Authenticity
                  </Heading>
                  <Text textAlign='center' opacity={0.9}>
                    Every product verification is recorded immutably on the
                    Hedera network
                  </Text>
                </VStack>
              </Box>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box py={16} bg={bg}>
        <Container maxW='7xl'>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
            <StatCard number='100%' label='Secure Verification' />
            <StatCard number='24/7' label='Available Globally' />
            <StatCard number='0.001s' label='Fast Verification' />
            <StatCard number='∞' label='Scalable Solution' />
          </SimpleGrid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box py={20}>
        <Container maxW='7xl'>
          <VStack spacing={16}>
            <VStack spacing={4} textAlign='center'>
              <Heading
                size='2xl'
                color={useColorModeValue('gray.800', 'gray.100')}
              >
                How Hexagon Works
              </Heading>
              <Text
                fontSize='lg'
                color={useColorModeValue('gray.600', 'gray.300')}
                maxW='600px'
              >
                Our simple 4-step process ensures pharmaceutical authenticity
                through blockchain technology
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
              <FeatureCard
                icon={FiUsers}
                title='1. Register Brand'
                description='Manufacturer connects wallet and registers their brand on the Hedera network with verified credentials.'
              />
              <FeatureCard
                icon={FiPackage}
                title='2. Create Product'
                description='Add product details including batch numbers, manufacture dates, and metadata stored securely on IPFS.'
              />
              <FeatureCard
                icon={FiCheck}
                title='3. Generate Codes'
                description='Create unique verification codes, mint hashed versions on-chain, and download printable CSV files.'
              />
              <FeatureCard
                icon={FiShield}
                title='4. Verify Authenticity'
                description='Customers verify products instantly using product name and code. Duplicates are automatically rejected.'
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20} bg={bg}>
        <Container maxW='7xl'>
          <Grid
            templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
            gap={16}
            alignItems='center'
          >
            <GridItem>
              <VStack spacing={6} align='start'>
                <Heading
                  size='2xl'
                  color={useColorModeValue('gray.800', 'gray.100')}
                >
                  Why Choose Hexagon?
                </Heading>
                <VStack spacing={4} align='start'>
                  <HStack spacing={4}>
                    <Icon
                      as={FiTrendingUp}
                      boxSize={6}
                      color={useColorModeValue('brand.500', 'brand.400')}
                    />
                    <Box>
                      <Text
                        fontWeight='600'
                        color={useColorModeValue('gray.800', 'gray.100')}
                      >
                        Hedera Testnet Integration
                      </Text>
                      <Text color={useColorModeValue('gray.600', 'gray.300')}>
                        Fast, low-cost, and EVM-compatible blockchain
                        infrastructure
                      </Text>
                    </Box>
                  </HStack>
                  <HStack spacing={4}>
                    <Icon
                      as={FiGlobe}
                      boxSize={6}
                      color={useColorModeValue('brand.500', 'brand.400')}
                    />
                    <Box>
                      <Text
                        fontWeight='600'
                        color={useColorModeValue('gray.800', 'gray.100')}
                      >
                        Open Verification
                      </Text>
                      <Text color={useColorModeValue('gray.600', 'gray.300')}>
                        Anyone can verify product authenticity using publicly
                        available on-chain data
                      </Text>
                    </Box>
                  </HStack>
                  <HStack spacing={4}>
                    <Icon
                      as={FiPackage}
                      boxSize={6}
                      color={useColorModeValue('brand.500', 'brand.400')}
                    />
                    <Box>
                      <Text
                        fontWeight='600'
                        color={useColorModeValue('gray.800', 'gray.100')}
                      >
                        Printable Integration
                      </Text>
                      <Text color={useColorModeValue('gray.600', 'gray.300')}>
                        Simple printable codes designed for existing packaging
                        workflows
                      </Text>
                    </Box>
                  </HStack>
                </VStack>
              </VStack>
            </GridItem>
            <GridItem>
              <Card>
                <CardBody p={8}>
                  <VStack spacing={6}>
                    <Icon
                      as={FiShield}
                      boxSize={20}
                      color={useColorModeValue('brand.500', 'brand.400')}
                    />
                    <Heading
                      size='lg'
                      textAlign='center'
                      color={useColorModeValue('gray.800', 'gray.100')}
                    >
                      Counterfeit Protection
                    </Heading>
                    <Text
                      textAlign='center'
                      color={useColorModeValue('gray.600', 'gray.300')}
                    >
                      Our blockchain-based verification system makes it
                      virtually impossible to counterfeit products, protecting
                      both manufacturers and consumers.
                    </Text>
                    <Button
                      as={Link}
                      href='/verification'
                      colorScheme='blue'
                      size='lg'
                      leftIcon={<Icon as={FiCheck} />}
                    >
                      Try Verification
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={20} bgGradient={bgGradient} color='white'>
        <Container maxW='7xl'>
          <VStack spacing={8} textAlign='center'>
            <Heading size='2xl'>Ready to Secure Your Products?</Heading>
            <Text fontSize='lg' opacity={0.9} maxW='600px'>
              Join the future of pharmaceutical verification. Protect your brand
              and give your customers confidence.
            </Text>
            <HStack spacing={4}>
              <Button
                as={Link}
                href='/manufacturer'
                size='lg'
                bg='white'
                color='blue.500'
                _hover={{ bg: 'gray.100', transform: 'translateY(-2px)' }}
              >
                Get Started as Manufacturer
              </Button>
              <Button
                as={Link}
                href='/verification'
                size='lg'
                variant='outline'
                borderColor='white'
                color='white'
                _hover={{ bg: 'whiteAlpha.200', transform: 'translateY(-2px)' }}
              >
                Verify a Product
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}
