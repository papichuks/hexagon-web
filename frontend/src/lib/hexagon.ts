import Hexagon from '@/abi/Hexagon.json';
import { keccak256, encodeAbiParameters, stringToHex, pad } from 'viem';

export function encodeCode(code: string): `0x${string}` {
  // Convert string to bytes32 format
  return pad(stringToHex(code), { size: 32 });
}

export function hashCode(code: string): `0x${string}` {
  const codeB32 = encodeCode(code);
  const encoded = encodeAbiParameters([{ type: 'bytes32' }], [codeB32]);
  return keccak256(encoded);
}

export const HEXAGON_ABI = Hexagon.abi as any;
