'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Input,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  FormControl,
  FormLabel,
  Badge,
  Divider,
  useToast,
  useColorModeValue,
  SimpleGrid,
  Spinner,
  Image,
  Link,
  AspectRatio,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
} from '@chakra-ui/react';
import {
  FiInfo,
  FiSearch,
  FiPackage,
  FiCalendar,
  FiGlobe,
  FiHash,
  FiUser,
  FiFileText,
  FiDownload,
  FiEye,
  FiMapPin,
} from 'react-icons/fi';
import { useReadContract } from 'wagmi';
import Hexagon from '@/abi/Hexagon.json';

export default function ProductInfo() {
  const [productName, setProductName] = useState('');
  const [searchedProduct, setSearchedProduct] = useState('');
  const [ipfsContent, setIpfsContent] = useState<{
    image?: string;
    description?: string;
    pdf?: string;
  }>({});
  const [loadingContent, setLoadingContent] = useState(false);
  const toast = useToast();
  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  // Read product info from contract
  const {
    data: productData,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: process.env.NEXT_PUBLIC_HEXAGON_ADDRESS as `0x${string}`,
    abi: Hexagon.abi as any,
    functionName: 'getProduct',
    args: [searchedProduct],
    query: { enabled: Boolean(searchedProduct) },
  });

  const formatProductData = useCallback((data: any) => {
    if (!data || !data[0]) return null;

    const raw = String(data[2] || '');
    const name = data[1];
    const gatewayHost = process.env.NEXT_PUBLIC_GATEWAY_URL || 'ipfs.io';
    let resolved = raw;
    if (raw.startsWith('ipfs://')) {
      const p = raw.replace('ipfs://', '');
      const [cid] = p.split('/');
      resolved = `https://${gatewayHost}/ipfs/${cid}`;
    } else if (!raw.startsWith('http')) {
      resolved = `https://${gatewayHost}/ipfs/${raw}`;
    }

    return {
      manufacturer: data[3],
      metadataUrl: resolved,
      name: name,
      exists: data[0] !== '0',
    };
  }, []);

  const product = useMemo(
    () => formatProductData(productData),
    [formatProductData, productData]
  );

  // Read manufacturer info from contract
  const { data: manufacturerData, isLoading: manufacturerLoading } =
    useReadContract({
      address: process.env.NEXT_PUBLIC_HEXAGON_ADDRESS as `0x${string}`,
      abi: Hexagon.abi as any,
      functionName: 'getManufacturer',
      args: product ? [product.manufacturer] : [],
      query: { enabled: Boolean(product?.manufacturer) },
    });

  // Fetch IPFS content when product data is available
  useEffect(() => {
    const fetchIpfsContent = async () => {
      if (
        !productData ||
        !Array.isArray(productData) ||
        !productData[0] ||
        !productData[2]
      )
        return;

      setLoadingContent(true);
      try {
        const raw = String(productData[2] || '');
        const gatewayHost = process.env.NEXT_PUBLIC_GATEWAY_URL || 'ipfs.io';
        let baseUrl = raw;
        const dir = product?.name.toLowerCase();

        if (raw.startsWith('ipfs://')) {
          const p = raw.replace('ipfs://', '');
          const [cid] = p.split('/');
          baseUrl = `https://${gatewayHost}/ipfs/${cid}/${dir}`;
        } else if (!raw.startsWith('http')) {
          baseUrl = `https://${gatewayHost}/ipfs/${raw}/${dir}`;
        }

        console.log('Base URL for IPFS content:', baseUrl);

        // Fetch image
        try {
          const imageUrl = `${baseUrl}/image.png`;
          console.log('Trying to fetch image from:', imageUrl);
          const imageResponse = await fetch(imageUrl);
          if (imageResponse.ok) {
            setIpfsContent((prev) => ({ ...prev, image: imageUrl }));
          } else {
            console.log('Image not found at:', imageUrl);
          }
        } catch (error) {
          console.log('Image fetch error:', error);
        }

        // Fetch description
        try {
          const descUrl = `${baseUrl}/description.txt`;
          console.log('Trying to fetch description from:', descUrl);
          const descResponse = await fetch(descUrl);
          if (descResponse.ok) {
            const description = await descResponse.text();
            setIpfsContent((prev) => ({ ...prev, description }));
          } else {
            console.log('Description not found at:', descUrl);
          }
        } catch (error) {
          console.log('Description fetch error:', error);
        }

        // Fetch PDF
        try {
          const pdfUrl = `${baseUrl}/file.pdf`;
          console.log('Trying to fetch PDF from:', pdfUrl);
          const pdfResponse = await fetch(pdfUrl);
          if (pdfResponse.ok) {
            setIpfsContent((prev) => ({ ...prev, pdf: pdfUrl }));
          } else {
            console.log('PDF not found at:', pdfUrl);
          }
        } catch (error) {
          console.log('PDF fetch error:', error);
        }
      } catch (error) {
        console.error('Error fetching IPFS content:', error);
      } finally {
        setLoadingContent(false);
      }
    };

    if (
      productData &&
      Array.isArray(productData) &&
      productData[0] &&
      productData[0] !== '0'
    ) {
      fetchIpfsContent();
    }
  }, [productData, searchedProduct]);

  async function onSearch() {
    if (!productName.trim()) {
      toast({
        title: 'Product Name Required',
        description: 'Please enter a product name to search',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Reset previous content
    setIpfsContent({});
    setSearchedProduct(productName);
    refetch();
  }

  const formatManufacturerData = (data: any) => {
    if (!data) return null;
    return {
      id: Number(data[0]),
      name: data[1],
      wallet: data[2],
      products: data[3] || [],
    };
  };

  const manufacturer = formatManufacturerData(manufacturerData);

  return (
    <Container maxW='4xl' py={8}>
      <VStack spacing={8} align='stretch'>
        {/* Header */}
        <Box textAlign='center'>
          <VStack spacing={4}>
            <Box p={4} bg='blue.100' borderRadius='full' display='inline-block'>
              <Icon as={FiInfo} boxSize={12} color='blue.600' />
            </Box>
            <Heading size='2xl' color={useColorModeValue('gray.800', 'white')}>
              Product Information
            </Heading>
            <Text
              fontSize='lg'
              color={useColorModeValue('gray.600', 'gray.300')}
              maxW='600px'
            >
              Get detailed information about any registered product using its
              name
            </Text>
          </VStack>
        </Box>

        {/* Search Form */}
        <Card bg={bg}>
          <CardHeader>
            <Heading size='lg' color={useColorModeValue('gray.800', 'white')}>
              <Icon as={FiSearch} mr={2} />
              Search Product
            </Heading>
            <Text color={useColorModeValue('gray.600', 'gray.300')} mt={2}>
              Enter the product name to get detailed information
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align='stretch'>
              <FormControl isRequired>
                <FormLabel>Product Name</FormLabel>
                <Input
                  placeholder='Enter the exact product name'
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  size='lg'
                  onKeyPress={(e) => e.key === 'Enter' && onSearch()}
                />
                <Text
                  fontSize='xs'
                  color={useColorModeValue('gray.500', 'gray.400')}
                  mt={1}
                >
                  Enter the product name exactly as registered by the
                  manufacturer
                </Text>
              </FormControl>

              <Button
                onClick={onSearch}
                disabled={!productName || isLoading}
                isLoading={isLoading}
                loadingText='Searching...'
                colorScheme='blue'
                size='lg'
                leftIcon={<Icon as={FiSearch} />}
              >
                Get Product Info
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card bg={bg}>
            <CardBody>
              <VStack spacing={4} py={8}>
                <Spinner size='xl' color='blue.500' />
                <Text color={useColorModeValue('gray.600', 'gray.300')}>
                  Searching for product information...
                </Text>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Product Information */}
        {searchedProduct && !isLoading && product && (
          <>
            {product.exists ? (
              <Card bg={bg}>
                <CardHeader>
                  <HStack justify='space-between' align='center'>
                    <Heading
                      size='lg'
                      color={useColorModeValue('gray.800', 'white')}
                    >
                      <Icon as={FiPackage} mr={2} />
                      {searchedProduct}
                    </Heading>
                    <Badge
                      colorScheme='green'
                      px={3}
                      py={1}
                      borderRadius='full'
                    >
                      Registered Product
                    </Badge>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={8} align='stretch'>
                    {/* Product Image */}
                    {ipfsContent.image && (
                      <Card bg={cardBg}>
                        <CardBody>
                          <VStack spacing={4} align='center'>
                            <Heading
                              size='md'
                              color={useColorModeValue('gray.800', 'white')}
                            >
                              <Icon as={FiEye} mr={2} />
                              Product Image
                            </Heading>
                            <AspectRatio ratio={16 / 9} w='full' maxW='400px'>
                              <Image
                                src={ipfsContent.image}
                                alt={`${searchedProduct} product image`}
                                borderRadius='lg'
                                objectFit='cover'
                              />
                            </AspectRatio>
                          </VStack>
                        </CardBody>
                      </Card>
                    )}

                    {/* Product Description */}
                    {ipfsContent.description && (
                      <Card bg={cardBg}>
                        <CardBody>
                          <VStack align='start' spacing={4}>
                            <Heading
                              size='md'
                              color={useColorModeValue('gray.800', 'white')}
                            >
                              <Icon as={FiFileText} mr={2} />
                              Product Description
                            </Heading>
                            <Text
                              color={useColorModeValue('gray.700', 'gray.300')}
                              whiteSpace='pre-wrap'
                              fontSize='sm'
                              lineHeight='tall'
                            >
                              {ipfsContent.description}
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    )}

                    {/* Product Document */}
                    {ipfsContent.pdf && (
                      <Card bg={cardBg}>
                        <CardBody>
                          <VStack align='start' spacing={4}>
                            <Heading
                              size='md'
                              color={useColorModeValue('gray.800', 'white')}
                            >
                              <Icon as={FiDownload} mr={2} />
                              Product Document
                            </Heading>
                            <Button
                              as='a'
                              href={ipfsContent.pdf}
                              target='_blank'
                              rel='noopener noreferrer'
                              colorScheme='blue'
                              leftIcon={<Icon as={FiDownload} />}
                              size='md'
                            >
                              Download PDF Document
                            </Button>
                          </VStack>
                        </CardBody>
                      </Card>
                    )}

                    {/* Manufacturer Information */}
                    {manufacturer && (
                      <Card bg={cardBg}>
                        <CardHeader>
                          <Heading
                            size='md'
                            color={useColorModeValue('gray.800', 'white')}
                          >
                            <Icon as={FiUser} mr={2} />
                            Manufacturer Information
                          </Heading>
                        </CardHeader>
                        <CardBody>
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            <VStack align='start' spacing={4}>
                              <Box>
                                <Text
                                  fontWeight='semibold'
                                  color={useColorModeValue('gray.800', 'white')}
                                  fontSize='sm'
                                >
                                  Manufacturer Name
                                </Text>
                                <Text
                                  color={useColorModeValue(
                                    'gray.600',
                                    'gray.300'
                                  )}
                                >
                                  {manufacturer.name}
                                </Text>
                              </Box>
                              <Box>
                                <Text
                                  fontWeight='semibold'
                                  color={useColorModeValue('gray.800', 'white')}
                                  fontSize='sm'
                                >
                                  Manufacturer ID
                                </Text>
                                <Text
                                  color={useColorModeValue(
                                    'gray.600',
                                    'gray.300'
                                  )}
                                >
                                  #{manufacturer.id}
                                </Text>
                              </Box>
                            </VStack>
                            <VStack align='start' spacing={4}>
                              <Box>
                                <Text
                                  fontWeight='semibold'
                                  color={useColorModeValue('gray.800', 'white')}
                                  fontSize='sm'
                                >
                                  Wallet Address
                                </Text>
                                <Text
                                  fontFamily='mono'
                                  fontSize='sm'
                                  color={useColorModeValue(
                                    'gray.600',
                                    'gray.300'
                                  )}
                                  wordBreak='break-all'
                                >
                                  {manufacturer.wallet}
                                </Text>
                              </Box>
                              <Box>
                                <Text
                                  fontWeight='semibold'
                                  color={useColorModeValue('gray.800', 'white')}
                                  fontSize='sm'
                                >
                                  Total Products
                                </Text>
                                <Text
                                  color={useColorModeValue(
                                    'gray.600',
                                    'gray.300'
                                  )}
                                >
                                  {manufacturer.products.length} registered
                                  products
                                </Text>
                              </Box>
                            </VStack>
                          </SimpleGrid>
                        </CardBody>
                      </Card>
                    )}

                    {/* Technical Details */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <Card bg={cardBg}>
                        <CardBody>
                          <VStack align='start' spacing={3}>
                            <HStack>
                              <Icon as={FiHash} color='blue.500' />
                              <Text
                                fontWeight='semibold'
                                color={useColorModeValue('gray.800', 'white')}
                              >
                                Manufacturer Address
                              </Text>
                            </HStack>
                            <Text
                              fontFamily='mono'
                              fontSize='sm'
                              color={useColorModeValue('gray.600', 'gray.300')}
                              wordBreak='break-all'
                            >
                              {product.manufacturer}
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>

                      {product.metadataUrl && (
                        <Card bg={cardBg}>
                          <CardBody>
                            <VStack align='start' spacing={3}>
                              <HStack>
                                <Icon as={FiGlobe} color='blue.500' />
                                <Text
                                  fontWeight='semibold'
                                  color={useColorModeValue('gray.800', 'white')}
                                >
                                  IPFS CID
                                </Text>
                              </HStack>
                              <Text
                                fontSize='sm'
                                color={useColorModeValue(
                                  'gray.600',
                                  'gray.300'
                                )}
                                wordBreak='break-all'
                              >
                                {
                                  product.metadataUrl
                                    .split('/ipfs/')[1]
                                    ?.split('/')[0]
                                }
                              </Text>
                            </VStack>
                          </CardBody>
                        </Card>
                      )}
                    </SimpleGrid>

                    {/* Loading IPFS Content */}
                    {loadingContent && (
                      <Card bg={cardBg}>
                        <CardBody>
                          <VStack spacing={4} py={4}>
                            <Spinner size='md' color='blue.500' />
                            <Text
                              color={useColorModeValue('gray.600', 'gray.300')}
                              fontSize='sm'
                            >
                              Loading additional content from IPFS...
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    )}

                    <Alert status='success' borderRadius='lg'>
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Product Verified!</AlertTitle>
                        <AlertDescription>
                          This product is registered on the Hedera blockchain
                          and can be verified for authenticity.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  </VStack>
                </CardBody>
              </Card>
            ) : (
              <Alert status='warning' borderRadius='lg'>
                <AlertIcon />
                <Box>
                  <AlertTitle>Product Not Found</AlertTitle>
                  <AlertDescription>
                    No product with the name "{searchedProduct}" was found in
                    the registry. Please check the spelling or contact the
                    manufacturer.
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </>
        )}

        {/* Error State */}
        {error && (
          <Alert status='error' borderRadius='lg'>
            <AlertIcon />
            <Box>
              <AlertTitle>Search Error</AlertTitle>
              <AlertDescription>
                An error occurred while searching for the product. Please try
                again.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        <Divider />

        {/* Information Section */}
        <Card bg={cardBg}>
          <CardBody>
            <VStack spacing={6} align='start'>
              <Heading size='md' color={useColorModeValue('gray.800', 'white')}>
                About Product Information
              </Heading>
              <VStack spacing={4} align='start'>
                <HStack spacing={4}>
                  <Box
                    minW={8}
                    h={8}
                    bg='blue.500'
                    color='white'
                    borderRadius='full'
                    display='flex'
                    alignItems='center'
                    justifyContent='center'
                    fontSize='sm'
                    fontWeight='bold'
                  >
                    1
                  </Box>
                  <Text color={useColorModeValue('gray.700', 'gray.300')}>
                    Search for any product registered on the Hedera blockchain
                  </Text>
                </HStack>
                <HStack spacing={4}>
                  <Box
                    minW={8}
                    h={8}
                    bg='blue.500'
                    color='white'
                    borderRadius='full'
                    display='flex'
                    alignItems='center'
                    justifyContent='center'
                    fontSize='sm'
                    fontWeight='bold'
                  >
                    2
                  </Box>
                  <Text color={useColorModeValue('gray.700', 'gray.300')}>
                    View manufacturer information and metadata details
                  </Text>
                </HStack>
                <HStack spacing={4}>
                  <Box
                    minW={8}
                    h={8}
                    bg='blue.500'
                    color='white'
                    borderRadius='full'
                    display='flex'
                    alignItems='center'
                    justifyContent='center'
                    fontSize='sm'
                    fontWeight='bold'
                  >
                    3
                  </Box>
                  <Text color={useColorModeValue('gray.700', 'gray.300')}>
                    Access additional product information through metadata links
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}
