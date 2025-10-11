'use client';
import { useMemo, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Heading,
  useToast,
  FormControl,
  FormLabel,
  Icon,
  Badge,
  List,
  ListItem,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { FiCode, FiDownload, FiRefreshCw, FiUpload } from 'react-icons/fi';
import ShortUniqueId from 'short-unique-id';
import { useWriteContract } from 'wagmi';
import { HEXAGON_ABI, hashCode } from '@/lib/hexagon';
import jsPDF from 'jspdf';

const uid = new ShortUniqueId({ length: 10 });

interface GenerateCodesProps {
  productName: string;
}

export default function GenerateCodes({ productName }: GenerateCodesProps) {
  const [amount, setAmount] = useState(10);
  const [codes, setCodes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { writeContractAsync } = useWriteContract();
  const toast = useToast();

  function generate() {
    if (amount < 1 || amount > 1000) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a number between 1 and 1000',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const list = Array.from({ length: amount }, () => uid.rnd());
    setCodes(list);

    toast({
      title: 'Codes Generated',
      description: `Generated ${amount} unique verification codes`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }

  async function onCreateItems() {
    if (!productName || codes.length === 0) {
      toast({
        title: 'Error',
        description: 'Please generate codes first',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSubmitting(true);
    try {
      const codeHashes = codes.map((c) => hashCode(c));
      await writeContractAsync({
        address: (process.env.NEXT_PUBLIC_HEXAGON_ADDRESS ||
          '0x0000000000000000000000000000000000000000') as `0x${string}`,
        abi: HEXAGON_ABI,
        functionName: 'createItems',
        args: [productName, codeHashes],
      });

      toast({
        title: 'Success!',
        description: `${codes.length} verification codes created on-chain`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Transaction Failed',
        description: error?.message || 'Failed to create items on-chain',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  }

  function downloadCSV() {
    if (codes.length === 0) {
      toast({
        title: 'No Codes Available',
        description: 'Please generate codes first',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const header = 'product,code,hash\n';
    const rows = codes
      .map((c) => `${productName},${c},${hashCode(c)}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${productName}_codes_${
      new Date().toISOString().split('T')[0]
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Download Started',
      description: 'CSV file with verification codes is downloading',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  }

  function downloadPrintableFormat() {
    if (codes.length === 0) {
      toast({
        title: 'No Codes Available',
        description: 'Please generate codes first',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const codeWidth = 50;
    const codeHeight = 25;
    const codesPerRow = Math.floor((pageWidth - 2 * margin) / codeWidth);
    const codesPerColumn = Math.floor(
      (pageHeight - 2 * margin - 40) / codeHeight
    );

    // Add header
    pdf.setFontSize(20);
    pdf.text('Verification Codes', pageWidth / 2, margin, { align: 'center' });
    pdf.setFontSize(16);
    pdf.text(productName, pageWidth / 2, margin + 10, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      margin + 20,
      { align: 'center' }
    );

    let yPosition = margin + 40;
    let xPosition = margin;
    let codeIndex = 0;

    codes.forEach((code, index) => {
      // Draw border
      pdf.rect(xPosition, yPosition, codeWidth, codeHeight);

      // Add product name (truncated if too long)
      pdf.setFontSize(8);
      const truncatedProductName =
        productName.length > 12
          ? productName.substring(0, 12) + '...'
          : productName;
      pdf.text(truncatedProductName, xPosition + codeWidth / 2, yPosition + 8, {
        align: 'center',
      });

      // Add code
      pdf.setFontSize(10);
      pdf.setFont('courier', 'bold');
      pdf.text(code, xPosition + codeWidth / 2, yPosition + 18, {
        align: 'center',
      });

      codeIndex++;
      xPosition += codeWidth;

      // Move to next row if needed
      if (codeIndex % codesPerRow === 0) {
        xPosition = margin;
        yPosition += codeHeight;

        // Add new page if needed
        if (yPosition + codeHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
      }
    });

    // Save the PDF
    pdf.save(
      `${productName}_printable_codes_${
        new Date().toISOString().split('T')[0]
      }.pdf`
    );

    toast({
      title: 'PDF Downloaded',
      description: 'PDF file with verification codes is ready for printing',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  }

  return (
    <Box>
      <VStack spacing={6} align='stretch'>
        <Box>
          <Heading size='md' mb={2} color='brand.dark'>
            <Icon as={FiCode} mr={2} />
            Generate Verification Codes
          </Heading>
          <Text color='gray.600' fontSize='sm'>
            Create unique codes for product verification
          </Text>
        </Box>

        <VStack spacing={4} align='stretch'>
          <FormControl>
            <FormLabel>Number of Codes</FormLabel>
            <NumberInput
              value={amount}
              onChange={(_, value) => setAmount(value)}
              min={1}
              max={1000}
              size='lg'
            >
              <NumberInputField placeholder='Enter number of codes' />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Text fontSize='xs' color='gray.500' mt={1}>
              Maximum 1000 codes per batch
            </Text>
          </FormControl>

          <HStack spacing={4}>
            <Button
              onClick={generate}
              leftIcon={<Icon as={FiRefreshCw} />}
              colorScheme='blue'
              variant='outline'
              size='lg'
              flex={1}
            >
              Generate Codes
            </Button>
            <Button
              onClick={onCreateItems}
              disabled={!productName || codes.length === 0 || submitting}
              isLoading={submitting}
              loadingText='Creating...'
              leftIcon={<Icon as={FiUpload} />}
              colorScheme='green'
              size='lg'
              flex={1}
            >
              Create On-Chain
            </Button>
          </HStack>

          {codes.length > 0 && (
            <>
              <Divider />

              <Alert status='success' borderRadius='md'>
                <AlertIcon />
                <Box>
                  <AlertTitle>Codes Generated!</AlertTitle>
                  <AlertDescription>
                    {codes.length} verification codes ready for download
                  </AlertDescription>
                </Box>
              </Alert>

              <HStack spacing={4}>
                <Button
                  onClick={downloadCSV}
                  leftIcon={<Icon as={FiDownload} />}
                  colorScheme='blue'
                  size='lg'
                  flex={1}
                >
                  Download CSV
                </Button>
                <Button
                  onClick={downloadPrintableFormat}
                  leftIcon={<Icon as={FiDownload} />}
                  colorScheme='purple'
                  size='lg'
                  flex={1}
                >
                  Download Printable
                </Button>
              </HStack>

              <Box>
                <HStack justify='space-between' align='center' mb={3}>
                  <Text fontWeight='medium' color='brand.dark'>
                    Code Preview
                  </Text>
                  <Badge colorScheme='blue' px={2} py={1}>
                    {codes.length} codes
                  </Badge>
                </HStack>

                <Box
                  bg='gray.50'
                  p={4}
                  borderRadius='md'
                  maxH='200px'
                  overflowY='auto'
                >
                  <List spacing={1}>
                    {codes.slice(0, 10).map((code, index) => (
                      <ListItem key={code} fontSize='sm' fontFamily='mono'>
                        <HStack justify='space-between'>
                          <Text>{code}</Text>
                          <Badge size='sm' colorScheme='gray'>
                            #{index + 1}
                          </Badge>
                        </HStack>
                      </ListItem>
                    ))}
                    {codes.length > 10 && (
                      <ListItem
                        fontSize='sm'
                        color='gray.500'
                        fontStyle='italic'
                      >
                        ...and {codes.length - 10} more codes
                      </ListItem>
                    )}
                  </List>
                </Box>
              </Box>
            </>
          )}
        </VStack>

        <Box
          bg='orange.50'
          p={4}
          borderRadius='md'
          borderLeft='4px solid'
          borderColor='orange.400'
        >
          <Text fontSize='sm' color='orange.800'>
            <strong>Important:</strong> After generating codes, make sure to
            create them on-chain before downloading. This ensures the codes are
            properly registered for verification.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
