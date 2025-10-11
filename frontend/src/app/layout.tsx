'use client';
import { ChakraProvider } from '@chakra-ui/react';
import WalletProviders from '@/providers/wallet';
import NavBar from '@/components/NavBar';
import theme from '@/theme';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>
        <ChakraProvider theme={theme}>
          <WalletProviders>
            <NavBar />
            {children}
          </WalletProviders>
        </ChakraProvider>
      </body>
    </html>
  );
}
