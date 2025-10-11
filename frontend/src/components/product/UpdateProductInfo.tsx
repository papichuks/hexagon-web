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
} from '@chakra-ui/react';
import { FiUpload, FiEdit } from 'react-icons/fi';
import { useWriteContract } from 'wagmi';
import { HEXAGON_ABI } from '@/lib/hexagon';

interface UpdateProductInfoProps {
  productName: string;
}

export default function UpdateProductInfo({
  productName,
}: UpdateProductInfoProps) {
  const [url, setUrl] = useState('');
  const [jsonText, setJsonText] = useState(`{
  "description": "",
  "website": "",
  "additionalInfo": ""
}`);
  const [loading, setLoading] = useState(false);
  const { writeContractAsync } = useWriteContract();
  const toast = useToast();

  async function uploadJSON() {
    try {
      const blob = new Blob([jsonText], { type: 'application/json' });
      const file = new File([blob], `${productName}-update.json`);

      const formData = new FormData();
      formData.append('file', file);

      // Set metadata
      const metadata = JSON.stringify({
        name: `${productName}-update-${Date.now()}`,
        keyvalues: {
          product: productName,
          type: 'update',
          timestamp: new Date().toISOString(),
        },
      });
      formData.append('pinataMetadata', metadata);
      // For a single JSON file, we do not need to wrap with a directory
      formData.append('pinataOptions', JSON.stringify({ wrapWithDirectory: false }));

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
      return `ipfs://${result.IpfsHash}`;
    } catch (e) {
      console.error('Upload error:', e);
      toast({
        title: 'Upload Error',
        description: e instanceof Error ? e.message : 'Failed to upload metadata to IPFS',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return undefined;
    }
  }

  async function onUpdate() {
    if (!productName) {
      toast({
        title: 'Error',
        description: 'Please enter a product name',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const finalUrl = url || (await uploadJSON()) || '';

      if (!finalUrl) {
        toast({
          title: 'Error',
          description: 'Please provide a URL or valid JSON metadata',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      await writeContractAsync({
        address: (process.env.NEXT_PUBLIC_HEXAGON_ADDRESS ||
          '0x0000000000000000000000000000000000000000') as `0x${string}`,
        abi: HEXAGON_ABI,
        functionName: 'updateProduct',
        args: [productName, finalUrl],
      });

      toast({
        title: 'Success',
        description: 'Product information updated successfully',
        status: 'success',
        variant: 'solid',
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setUrl('');
      setJsonText(`{
  "description": "",
  "website": "",
  "additionalInfo": ""
}`);
    } catch (error: any) {
      toast({
        title: 'Transaction Failed',
        description: error?.message || 'Failed to update product information',
        status: 'error',
        variant: 'solid',
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
            <Icon as={FiEdit} mr={2} />
            Update Product Information
          </Heading>
          <Text color='gray.600' fontSize='sm'>
            Provide a new metadata URL or paste JSON to upload to IPFS
          </Text>
        </Box>

        <VStack spacing={4} align='stretch'>
          <FormControl>
            <FormLabel>Metadata URL (Optional)</FormLabel>
            <Input
              placeholder='https://example.com/metadata.json'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              size='lg'
            />
            <Text fontSize='xs' color='gray.500' mt={1}>
              Leave empty to upload JSON to IPFS automatically
            </Text>
          </FormControl>

          <FormControl>
            <FormLabel>JSON Metadata</FormLabel>
            <Textarea
              rows={8}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='Enter JSON metadata...'
              fontFamily='mono'
              fontSize='sm'
            />
            <Text fontSize='xs' color='gray.500' mt={1}>
              Valid JSON format required for IPFS upload
            </Text>
          </FormControl>

          <HStack spacing={4}>
            <Button
              onClick={onUpdate}
              disabled={!productName || loading}
              isLoading={loading}
              loadingText='Updating...'
              colorScheme='blue'
              size='lg'
              leftIcon={<Icon as={FiUpload} />}
              flex={1}
            >
              Update Product Info
            </Button>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
}
