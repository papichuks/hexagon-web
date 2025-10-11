'use client';
import { useEffect, useState } from 'react';
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
  useToast,
} from '@chakra-ui/react';
import { FiUser, FiShield, FiArrowRight } from 'react-icons/fi';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import Hexagon from '@/abi/Hexagon.json';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Manufacturer() {
  const { address, isConnected } = useAccount();
  const [brand, setBrand] = useState('');
  const { writeContractAsync, isPending } = useWriteContract();
  const [isRegistered, setIsRegistered] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { isLoading: isWaiting, isSuccess: isMined } = useWaitForTransactionReceipt({ hash: txHash });
  const toast = useToast();
  const router = useRouter();

  // Check if already a manufacturer; if yes, go to dashboard
  const { data: isManufacturer } = useReadContract({
    address: process.env.NEXT_PUBLIC_HEXAGON_ADDRESS as `0x${string}`,
    abi: Hexagon.abi as any,
    functionName: 'isManufacturer',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    query: { enabled: !!address },
  });

  useEffect(() => {
    if (isManufacturer === true) {
      router.replace('/manufacturer/home');
    }
  }, [isManufacturer, router]);

  async function onRegister() {
    if (!brand.trim()) {
      toast({
        title: 'Brand Name Required',
        description: 'Please enter your brand name',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      console.log('Registering...');
      console.log(
        process.env.NEXT_PUBLIC_HEXAGON_ADDRESS,
        '-->hexagon address'
      );
      const hash = await writeContractAsync({
        address: process.env.NEXT_PUBLIC_HEXAGON_ADDRESS as `0x${string}`,
        abi: Hexagon.abi as any,
        functionName: 'register',
        args: [brand],
      });
      setTxHash(hash);
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error?.message || 'Failed to register brand',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }

  useEffect(() => {
    if (isMined) {
      setIsRegistered(true);
      toast({
        title: 'Registration Successful!',
        description: `Brand "${brand}" has been registered successfully`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      const t = setTimeout(() => router.replace('/manufacturer/home'), 1200);
      return () => clearTimeout(t);
    }
  }, [isMined, brand, router, toast]);

  if (!isConnected) {
    return (
      <Container maxW='4xl' py={8}>
        <VStack spacing={8} align='stretch'>
          <Box textAlign='center'>
            <VStack spacing={4}>
              <Box
                p={4}
                bg='blue.100'
                borderRadius='full'
                display='inline-block'
              >
                <Icon as={FiUser} boxSize={12} color='blue.600' />
              </Box>
              <Heading size='2xl' color='brand.dark'>
                Manufacturer Registration
              </Heading>
              <Text fontSize='lg' color='gray.600' maxW='600px'>
                Connect your wallet to register as a manufacturer and start
                creating verified products
              </Text>
            </VStack>
          </Box>

          <Alert status='warning' borderRadius='lg'>
            <AlertIcon />
            <Box>
              <AlertTitle>Wallet Connection Required</AlertTitle>
              <AlertDescription>
                Please connect your wallet using the button in the navigation
                bar to access manufacturer features.
              </AlertDescription>
            </Box>
          </Alert>
        </VStack>
      </Container>
    );
  }

  if (isRegistered) {
    return (
      <Container maxW='4xl' py={8}>
        <VStack spacing={8} align='stretch'>
          <Alert
            status='success'
            borderRadius='lg'
            p={6}
            flexDirection='column'
            alignItems='center'
            textAlign='center'
          >
            <Box p={3} bg='green.100' borderRadius='full' mb={4}>
              <Icon as={FiShield} boxSize={8} color='green.600' />
            </Box>
            <AlertTitle fontSize='xl' mb={2}>
              Registration Complete!
            </AlertTitle>
            <AlertDescription fontSize='md' maxW='600px' mb={4}>
              Your brand "{brand}" has been successfully registered on the
              Hedera blockchain. You can now create products and generate
              verification codes.
            </AlertDescription>
            <Button
              as={Link}
              href='/manufacturer/home'
              colorScheme='green'
              size='lg'
              rightIcon={<Icon as={FiArrowRight} />}
            >
              Go to Dashboard
            </Button>
          </Alert>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW='4xl' py={8}>
      <VStack spacing={8} align='stretch'>
        {/* Header */}
        <Box textAlign='center'>
          <VStack spacing={4}>
            <Box p={4} bg='blue.100' borderRadius='full' display='inline-block'>
              <Icon as={FiUser} boxSize={12} color='blue.600' />
            </Box>
            <Heading size='2xl' color='brand.dark'>
              Manufacturer Registration
            </Heading>
            <Text fontSize='lg' color='gray.600' maxW='600px'>
              Register your brand on the Hedera blockchain to start creating
              verified pharmaceutical products
            </Text>
          </VStack>
        </Box>

        {/* Account Info */}
        <Card>
          <CardBody>
            <VStack spacing={4} align='start'>
              <Heading size='md' color='brand.dark'>
                Connected Account
              </Heading>
              <HStack spacing={4}>
                <Badge colorScheme='green' px={3} py={1} borderRadius='full'>
                  Connected
                </Badge>
                <Text fontFamily='mono' fontSize='sm' color='gray.600'>
                  {address}
                </Text>
              </HStack>
              <Text fontSize='sm' color='gray.500'>
                This wallet address will be associated with your brand
                registration
              </Text>
            </VStack>
          </CardBody>
        </Card>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <Heading size='lg' color='brand.dark'>
              Brand Registration
            </Heading>
            <Text color='gray.600' mt={2}>
              Enter your brand information to register on the blockchain
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align='stretch'>
              <FormControl isRequired>
                <FormLabel>Brand Name</FormLabel>
                <Input
                  placeholder='Enter your brand name'
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  size='lg'
                />
                <Text fontSize='xs' color='gray.500' mt={1}>
                  This name will be permanently associated with your products
                </Text>
              </FormControl>

              <Button
                onClick={onRegister}
                disabled={!isConnected || !brand || isPending || isWaiting}
                isLoading={isPending || isWaiting}
                loadingText={isWaiting ? 'Waiting for confirmation...' : 'Registering...'}
                colorScheme='blue'
                size='lg'
                leftIcon={<Icon as={FiShield} />}
              >
                Register Brand
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Information Cards */}
        <VStack spacing={4} align='stretch'>
          <Card bg='blue.50' borderColor='blue.200'>
            <CardBody>
              <VStack spacing={4} align='start'>
                <Heading size='md' color='brand.dark'>
                  What happens after registration?
                </Heading>
                <VStack align='start' spacing={2} pl={4}>
                  <Text color='gray.700'>
                    • Your brand will be permanently recorded on the Hedera
                    blockchain
                  </Text>
                  <Text color='gray.700'>
                    • You'll gain access to the manufacturer dashboard
                  </Text>
                  <Text color='gray.700'>
                    • You can create products and generate verification codes
                  </Text>
                  <Text color='gray.700'>
                    • Customers will be able to verify your products'
                    authenticity
                  </Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          <Alert status='info' borderRadius='lg'>
            <AlertIcon />
            <Box>
              <AlertTitle>Important Notice</AlertTitle>
              <AlertDescription>
                Brand registration is permanent and cannot be changed. Make sure
                your brand name is correct before proceeding. The registration
                requires a small transaction fee on the Hedera network.
              </AlertDescription>
            </Box>
          </Alert>
        </VStack>
      </VStack>
    </Container>
  );
}
