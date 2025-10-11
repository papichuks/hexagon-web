'use client';
import { useState } from 'react';
import {
  Box,
  VStack,
  Input,
  Textarea,
  Button,
  Text,
  Heading,
  useToast,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  SimpleGrid,
} from '@chakra-ui/react';
import { FiPlus, FiPackage } from 'react-icons/fi';
import { useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { config } from '@/lib/wagmi';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { HEXAGON_ABI } from '@/lib/hexagon';

export default function CreateProductForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { writeContractAsync } = useWriteContract();
  const toast = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  async function uploadFilesToIpfs() {
    try {
      const formData = new FormData();
      const dir = name.toLowerCase(); // ensure a single root directory

      // Add description file
      const descriptionBlob = new Blob([description], { type: 'text/plain' });
      formData.append('file', descriptionBlob, `${dir}/description.txt`);

      // Add image if present
      if (imageFile) {
        formData.append('file', imageFile, `${dir}/image.png`);
      }

      // Add PDF if present
      if (pdfFile) {
        formData.append('file', pdfFile, `${dir}/file.pdf`);
      }

      // Set metadata
      const metadata = JSON.stringify({
        name: `hexagon-product-${name.toLowerCase()}`,
        keyvalues: {
          product: name,
          timestamp: new Date().toISOString(),
        },
      });
      formData.append('pinataMetadata', metadata);
      formData.append(
        'pinataOptions',
        JSON.stringify({ wrapWithDirectory: true })
      );

      // Upload via server API to avoid exposing credentials
      const response = await fetch('/api/ipfs/pin', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let detail = '';
        try {
          const j = await response.json();
          detail = j?.error || JSON.stringify(j);
        } catch {
          try {
            detail = await response.text();
          } catch {}
        }
        throw new Error(`Upload failed (${response.status}): ${detail}`);
      }

      const result = await response.json();
      return result.IpfsHash as string;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to upload files to IPFS',
        status: 'error',
        variant: 'solid',
      });
      return undefined;
    }
  }

  async function onCreate() {
    console.log('Creating product...', name, description, imageFile, pdfFile);
    if (!name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Product name is required',
        status: 'error',
        variant: 'solid',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    console.log('name present');
    if (!description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Product description is required',
        status: 'error',
        variant: 'solid',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    console.log('description present');
    if (!pdfFile) {
      toast({
        title: 'Validation Error',
        description: 'Product document (PDF) is required',
        status: 'error',
        variant: 'solid',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    console.log('pdf present');
    setLoading(true);
    console.log('Creating product...', name, description, imageFile, pdfFile);
    try {
      console.log('uploading to IPFS...');
      const cid = await uploadFilesToIpfs();
      console.log(cid);
      if (!cid) throw new Error('Upload failed');

      const hash = await writeContractAsync({
        address: (process.env.NEXT_PUBLIC_HEXAGON_ADDRESS ||
          '0x0000000000000000000000000000000000000000') as `0x${string}`,
        abi: HEXAGON_ABI,
        functionName: 'createProduct',
        args: [name, `ipfs://${cid}`],
      });
      await waitForTransactionReceipt(config, { hash });

      // Refresh caches/UI
      queryClient.invalidateQueries();
      router.refresh();

      toast({
        title: 'Product Created',
        description: `"${name}" created successfully`,
        status: 'success',
        variant: 'solid',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });

      // Reset form
      setName('');
      setDescription('');
      setImageFile(null);
      setPdfFile(null);
    } catch (error: any) {
      toast({
        title: 'Transaction Failed',
        description: error?.message || 'Failed to create product',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <VStack spacing={6} align='stretch'>
        <Box>
          <Heading size='md' mb={2} color='brand.dark'>
            <Icon as={FiPackage} mr={2} />
            Product Information
          </Heading>
          <Text color='gray.600' fontSize='sm'>
            Enter detailed information about your product
          </Text>
        </Box>

        <VStack spacing={4} align='stretch'>
          <FormControl isRequired>
            <FormLabel>Product Name</FormLabel>
            <Input
              placeholder='Enter product name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              size='lg'
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              placeholder='Describe your product...'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </FormControl>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel>Product Image (optional)</FormLabel>
              <Input
                type='file'
                accept='image/*'
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Product Document (PDF)</FormLabel>
              <Input
                type='file'
                accept='application/pdf'
                onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
              />
            </FormControl>
          </SimpleGrid>

          <HStack spacing={4} pt={4}>
            <Button
              onClick={onCreate}
              disabled={!name || loading}
              isLoading={loading}
              loadingText='Creating Product...'
              colorScheme='blue'
              size='lg'
              leftIcon={<Icon as={FiPlus} />}
              flex={1}
            >
              Create Product
            </Button>
          </HStack>
        </VStack>

        <Box
          bg='blue.50'
          p={4}
          borderRadius='md'
          borderLeft='4px solid'
          borderColor='blue.400'
        >
          <Text fontSize='sm' color='blue.800'>
            <strong>Note:</strong> We store files on IPFS via Pinata with:
            description.txt, image.png (optional), and file.pdf. The contract
            stores the CID so legacy product pages resolve exactly as before.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
