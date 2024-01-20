import { Address } from "viem";
import { useReadContract } from "wagmi";
import { RegistryABI } from "../abis/Registry.js";

const REGISTRY: Address = "0x000000000000000000000000000000000000ce10";

export const useRegistryLookup = (key: string) => {
	return useReadContract({
		address: REGISTRY,
		abi: RegistryABI,
		functionName: "getAddressForStringOrDie",
		args: [key],
	})
}
