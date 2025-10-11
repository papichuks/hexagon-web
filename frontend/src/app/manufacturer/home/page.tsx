'use client';
import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  Button,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  Badge,
  SimpleGrid,
  useToast,
  Flex,
  Divider,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { FiPackage, FiCode, FiEdit, FiPlus, FiBox } from 'react-icons/fi';
import CreateProductForm from '@/components/product/CreateProductForm';
import GenerateCodes from '@/components/product/GenerateCodes';
import UpdateProductInfo from '@/components/product/UpdateProductInfo';
import { useAccount, useReadContract } from 'wagmi';
import Link from 'next/link';
import { HEXAGON_ABI } from '@/lib/hexagon';

export default function ManufacturerHome() {
  const [productName, setProductName] = useState('');
  const { address, isConnected } = useAccount();
  const { data: manufacturerData } = useReadContract({
    address: process.env.NEXT_PUBLIC_HEXAGON_ADDRESS as `0x${string}`,
    abi: HEXAGON_ABI,
    functionName: 'getManufacturer',
    args: [address as `0x${string}`],
  });

  const manufacturerInfo = manufacturerData as any[] | undefined;
  const [, manufacturerName, manufacturerAddress, manufacturerProducts] =
    manufacturerInfo || [];

  if (!isConnected) {
    return (
      <Container maxW='7xl' py={8}>
        <Card>
          <CardBody textAlign='center' py={12}>
            <VStack spacing={4}>
              <Icon as={FiPackage} boxSize={16} color='gray.400' />
              <Heading size='lg' color='gray.600'>
                Connect Your Wallet
              </Heading>
              <Text color='gray.500'>
                Please connect your wallet to access the manufacturer dashboard
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxW='7xl' py={8}>
      {/* Header */}
      <Box mb={8}>
        <HStack justify='space-between' align='center' mb={4}>
          <VStack align='start' spacing={1}>
            <Heading size='2xl' color='brand.dark'>
              {manufacturerName}
            </Heading>
            <Text color='gray.600'>
              Manage your products and generate verification codes
            </Text>
          </VStack>
          <Badge colorScheme='green' px={3} py={1} borderRadius='full'>
            Address: {manufacturerAddress?.slice(0, 6)}...
            {manufacturerAddress?.slice(-4)}
          </Badge>
        </HStack>
      </Box>

      {/* Main Layout with Sidebar */}
      <Flex gap={8} align='start'>
        {/* Left Sidebar - Stats and Product List */}
        <Box w='300px' flexShrink={0}>
          {/* Stats Section */}
          <Card mb={6}>
            <CardHeader>
              <Heading size='md' color='brand.dark'>
                Dashboard Stats
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align='stretch'>
                <Box>
                  <HStack spacing={3}>
                    <Box p={2} bg='brand.lightBlue' borderRadius='md'>
                      <Icon as={FiPackage} boxSize={4} color='brand.blue' />
                    </Box>
                    <VStack align='start' spacing={0}>
                      <Text fontSize='xl' fontWeight='bold' color='brand.dark'>
                        {manufacturerProducts?.length || 0}
                      </Text>
                      <Text color='gray.600' fontSize='sm'>
                        Products Created
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                <Divider />

                <Box>
                  <HStack spacing={3}>
                    <Box p={2} bg='green.100' borderRadius='md'>
                      <Icon as={FiCode} boxSize={4} color='green.600' />
                    </Box>
                    <VStack align='start' spacing={0}>
                      <Text fontSize='xl' fontWeight='bold' color='brand.dark'>
                        0
                      </Text>
                      <Text color='gray.600' fontSize='sm'>
                        Codes Generated
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                <Divider />

                <Box>
                  <HStack spacing={3}>
                    <Box p={2} bg='purple.100' borderRadius='md'>
                      <Icon as={FiEdit} boxSize={4} color='purple.600' />
                    </Box>
                    <VStack align='start' spacing={0}>
                      <Text fontSize='xl' fontWeight='bold' color='brand.dark'>
                        0
                      </Text>
                      <Text color='gray.600' fontSize='sm'>
                        Verifications
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Product List */}
          <Card>
            <CardHeader>
              <Heading size='md' color='brand.dark'>
                Your Products
              </Heading>
            </CardHeader>
            <CardBody>
              {manufacturerProducts && manufacturerProducts.length > 0 ? (
                <List spacing={3}>
                  {manufacturerProducts.map(
                    (product: string, index: number) => (
                      <ListItem key={index}>
                        <HStack spacing={3}>
                          <ListIcon as={FiBox} color='brand.blue' />
                          <Link
                            href={`/product/${encodeURIComponent(product)}`}
                          >
                            <Text
                              fontSize='sm'
                              color='blue.600'
                              textDecoration='underline'
                              noOfLines={1}
                            >
                              {product}
                            </Text>
                          </Link>
                        </HStack>
                      </ListItem>
                    )
                  )}
                </List>
              ) : (
                <VStack spacing={3} py={4}>
                  <Icon as={FiPackage} boxSize={8} color='gray.400' />
                  <Text color='gray.500' fontSize='sm' textAlign='center'>
                    No products created yet. Create your first product to get
                    started.
                  </Text>
                </VStack>
              )}
            </CardBody>
          </Card>
        </Box>

        {/* Main Content Area */}
        <Box flex={1}>
          <Tabs variant='enclosed' colorScheme='blue'>
            <TabList>
              <Tab>
                <Icon as={FiPlus} mr={2} />
                Create Product
              </Tab>
              <Tab>
                <Icon as={FiCode} mr={2} />
                Generate Codes
              </Tab>
              <Tab>
                <Icon as={FiEdit} mr={2} />
                Update Product
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                <Card>
                  <CardHeader>
                    <Heading size='lg' color='brand.dark'>
                      Create New Product
                    </Heading>
                    <Text color='gray.600' mt={2}>
                      Add a new product to your catalog with detailed
                      information
                    </Text>
                  </CardHeader>
                  <CardBody>
                    <CreateProductForm />
                  </CardBody>
                </Card>
              </TabPanel>

              <TabPanel px={0}>
                <VStack spacing={6} align='stretch'>
                  <Card>
                    <CardHeader>
                      <Heading size='lg' color='brand.dark'>
                        Generate Verification Codes
                      </Heading>
                      <Text color='gray.600' mt={2}>
                        Create unique codes for your products and download them
                        for printing
                      </Text>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align='stretch'>
                        <Box>
                          <Text mb={2} fontWeight='medium'>
                            Select Product
                          </Text>
                          <Select
                            placeholder='Select a product'
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            size='lg'
                          >
                            {manufacturerProducts?.map((product: string) => (
                              <option key={product} value={product}>
                                {product}
                              </option>
                            ))}
                          </Select>
                        </Box>
                        {productName && (
                          <Box>
                            <GenerateCodes productName={productName} />
                          </Box>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>

              <TabPanel px={0}>
                <Card>
                  <CardHeader>
                    <Heading size='lg' color='brand.dark'>
                      Update Product Information
                    </Heading>
                    <Text color='gray.600' mt={2}>
                      Modify existing product details and add additional
                      information
                    </Text>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align='stretch'>
                      <Box>
                        <Text mb={2} fontWeight='medium'>
                          Select Product
                        </Text>
                        <Select
                          placeholder='Select a product'
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          size='lg'
                        >
                          {manufacturerProducts?.map((product: string) => (
                            <option key={product} value={product}>
                              {product}
                            </option>
                          ))}
                        </Select>
                      </Box>
                      {productName && (
                        <Box>
                          <UpdateProductInfo productName={productName} />
                        </Box>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>

          {/* Help Section */}
          <Card bg='blue.50' borderColor='blue.200' mt={8}>
            <CardBody>
              <VStack spacing={4} align='start'>
                <Heading size='md' color='brand.dark'>
                  Need Help?
                </Heading>
                <Text color='gray.700'>Follow these steps to get started:</Text>
                <VStack align='start' spacing={2} pl={4}>
                  <Text color='gray.700'>
                    1. Create a product with detailed information
                  </Text>
                  <Text color='gray.700'>
                    2. Generate unique verification codes for your product
                  </Text>
                  <Text color='gray.700'>
                    3. Download the CSV file and print codes on your packaging
                  </Text>
                  <Text color='gray.700'>
                    4. Customers can verify authenticity using the product name
                    and code
                  </Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </Flex>
    </Container>
  );
}
