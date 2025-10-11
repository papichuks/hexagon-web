'use client';
import { useState } from 'react';
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
  Spinner,
} from '@chakra-ui/react';
import { FiShield, FiCheck, FiX, FiSearch, FiClock } from 'react-icons/fi';
import { useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { config } from '@/lib/wagmi';
import Hexagon from '@/abi/Hexagon.json';
import { encodeCode } from '@/lib/hexagon';

export default function Verification() {
  const [productName, setProductName] = useState('');
  const [code, setCode] = useState('');
  const { writeContractAsync, isPending } = useWriteContract();
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'warning' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isConfirming, setIsConfirming] = useState(false);
  const toast = useToast();

  async function onVerify() {
    if (!productName.trim() || !code.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both product name and verification code',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const codeB32 = encodeCode(code);
    setStatus({ type: null, message: '' });
    setIsConfirming(false);

    try {
      // Show transaction signing status
      setStatus({
        type: 'info',
        message: 'Please sign the transaction to verify the product...',
      });

      // Send transaction
      const hash = await writeContractAsync({
        address: (process.env.NEXT_PUBLIC_HEXAGON_ADDRESS ||
          '0x0000000000000000000000000000000000000000') as `0x${string}`,
        abi: Hexagon.abi as any,
        functionName: 'checkAuthenticity',
        args: [productName, codeB32],
      });

      // Show confirmation status
      setIsConfirming(true);
      setStatus({
        type: 'info',
        message: 'Transaction submitted. Waiting for confirmation...',
      });

      // Wait for transaction confirmation
      const receipt = await waitForTransactionReceipt(config, {
        hash: hash,
      });

      // Check if transaction was successful
      if (receipt.status === 'success') {
        setStatus({
          type: 'success',
          message: 'Product is authentic and verified successfully!',
        });

        toast({
          title: 'Verification Successful',
          description: 'This product is authentic',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Transaction failed
        setStatus({
          type: 'error',
          message: 'Transaction failed. Please try again.',
        });

        toast({
          title: 'Verification Failed',
          description: 'Transaction failed. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (e: any) {
      const msg = String(e?.cause?.shortMessage || e?.message || '');
      let errorType: 'error' | 'warning' = 'error';
      let errorMessage = 'Error verifying product authenticity';

      if (msg.includes('Invalid code!')) {
        errorMessage =
          'Invalid verification code. This code does not exist for this product.';
      } else if (msg.includes('Product already bought!')) {
        errorType = 'warning';
        errorMessage =
          'This code has already been used for verification. Possible duplicate or counterfeit.';
      } else if (msg.includes('Product not found')) {
        errorMessage = 'Product not found. Please check the product name.';
      } else if (msg.includes('User rejected')) {
        errorMessage = 'Transaction was cancelled by user.';
      } else if (msg.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds to complete verification.';
      }

      setStatus({
        type: errorType,
        message: errorMessage,
      });

      toast({
        title: 'Verification Failed',
        description: errorMessage,
        status: errorType,
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsConfirming(false);
    }
  }

  const getStatusIcon = () => {
    switch (status.type) {
      case 'success':
        return FiCheck;
      case 'error':
        return FiX;
      case 'warning':
        return FiShield;
      case 'info':
        return isConfirming ? FiClock : FiShield;
      default:
        return FiShield;
    }
  };

  const getStatusColor = () => {
    switch (status.type) {
      case 'success':
        return 'green';
      case 'error':
        return 'red';
      case 'warning':
        return 'orange';
      default:
        return 'blue';
    }
  };

  return (
    <Container maxW='4xl' py={8}>
      <VStack spacing={8} align='stretch'>
        {/* Header */}
        <Box textAlign='center'>
          <VStack spacing={4}>
            <Box p={4} bg='blue.100' borderRadius='full' display='inline-block'>
              <Icon as={FiShield} boxSize={12} color='blue.600' />
            </Box>
            <Heading size='2xl' color='brand.dark'>
              Product Verification
            </Heading>
            <Text fontSize='lg' color='gray.600' maxW='600px'>
              Verify the authenticity of your pharmaceutical products using our
              blockchain-based verification system
            </Text>
          </VStack>
        </Box>

        {/* Verification Form */}
        <Card>
          <CardHeader>
            <Heading size='lg' color='brand.dark'>
              <Icon as={FiSearch} mr={2} />
              Verify Your Product
            </Heading>
            <Text color='gray.600' mt={2}>
              Enter the product name and verification code found on your
              packaging
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
                />
                <Text fontSize='xs' color='gray.500' mt={1}>
                  Enter the product name exactly as shown on the packaging
                </Text>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Verification Code</FormLabel>
                <Input
                  placeholder='Enter the verification code'
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  size='lg'
                  fontFamily='mono'
                />
                <Text fontSize='xs' color='gray.500' mt={1}>
                  Find this code on your product packaging or label
                </Text>
              </FormControl>

              <Button
                onClick={onVerify}
                disabled={!productName || !code || isPending || isConfirming}
                isLoading={isPending || isConfirming}
                loadingText={
                  isPending
                    ? 'Signing Transaction...'
                    : 'Confirming Transaction...'
                }
                colorScheme='blue'
                size='lg'
                leftIcon={
                  isConfirming ? <Spinner size='sm' /> : <Icon as={FiShield} />
                }
              >
                {isConfirming ? 'Confirming Transaction...' : 'Verify Product'}
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Verification Result */}
        {status.type && (
          <Alert
            status={status.type}
            borderRadius='lg'
            p={6}
            flexDirection='column'
            alignItems='center'
            textAlign='center'
          >
            <Box
              p={3}
              bg={`${getStatusColor()}.100`}
              borderRadius='full'
              mb={4}
            >
              <Icon
                as={getStatusIcon()}
                boxSize={8}
                color={`${getStatusColor()}.600`}
              />
            </Box>
            <AlertTitle fontSize='xl' mb={2}>
              {status.type === 'success' && 'Product Verified!'}
              {status.type === 'error' && 'Verification Failed'}
              {status.type === 'warning' && 'Warning: Potential Issue'}
            </AlertTitle>
            <AlertDescription fontSize='md' maxW='600px'>
              {status.message}
            </AlertDescription>
            {status.type === 'success' && (
              <Badge
                colorScheme='green'
                mt={4}
                px={3}
                py={1}
                borderRadius='full'
              >
                Authentic Product
              </Badge>
            )}
          </Alert>
        )}

        <Divider />

        {/* How It Works */}
        <Card bg='gray.50'>
          <CardBody>
            <VStack spacing={6} align='start'>
              <Heading size='md' color='brand.dark'>
                How Product Verification Works
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
                  <Text color='gray.700'>
                    Each authentic product has a unique verification code
                    printed on its packaging
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
                  <Text color='gray.700'>
                    The code is registered on the Hedera blockchain by the
                    manufacturer
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
                  <Text color='gray.700'>
                    When you verify, we check the blockchain to confirm
                    authenticity
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
                    4
                  </Box>
                  <Text color='gray.700'>
                    Each code can only be verified once to prevent
                    counterfeiting
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Security Notice */}
        <Alert status='info' borderRadius='lg'>
          <AlertIcon />
          <Box>
            <AlertTitle>Security Notice</AlertTitle>
            <AlertDescription>
              If you encounter any issues with verification or suspect a
              counterfeit product, please contact the manufacturer immediately.
              Never use products that fail verification.
            </AlertDescription>
          </Box>
        </Alert>
      </VStack>
    </Container>
  );
}
