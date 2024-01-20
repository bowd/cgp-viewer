import {
	Address,
	type Abi,
	AbiFunction,
	PublicClient,
	parseAbiItem,
	decodeFunctionData,
	Hex,
	isAddress,
} from 'viem';

const PROXY_IMPLEMENTATION_GETTERS = [
	'_getImplementation',
	'getImplementation',
	'_implementation',
	'implementation',
];

const PROXY_IMPLEMENTATION_SETTERS = [
	'function _setImplementation(address)',
	'function setImplementation(address)',
	'function setAndInitializeImplementation(address implementation, bytes initializer)',
	'function _setAndInitializeImplementation(address implementation, bytes initializer)',
];

const PROXY_ABI: Abi = PROXY_IMPLEMENTATION_GETTERS.map(funcName => ({
	constant: true,
	inputs: [],
	name: funcName,
	outputs: [
		{
			internalType: 'address',
			name: 'implementation',
			type: 'address',
		},
	],
	payable: false,
	stateMutability: 'view',
	type: 'function',
}));

/**
 * MetadataResponse interface for the `metadata.json` file that the sourcify repo returns.
 * All fields are optional because we don't really _know_ what we get from the API, thus
 * we need to enforce the structure at runtime.
 */
export interface MetadataResponse {
	output?: {
		abi?: Abi;
	};
	settings?: {
		compilationTarget?: Record<string, string>;
	};
}

export interface IMetadata {
	abi: Abi;
	contractName: string | null;
}

/**
 * Fetch the sourcify response and instantiate a Metadata wrapper class around it.
 * Try a full_match but fallback to partial_match when not strict.
 * @param connection @celo/connect instance
 * @param contract the address of the contract to query
 * @param strict only allow full matches https://docs.sourcify.dev/docs/full-vs-partial-match/
 * @returns Metadata or null
 */
export async function fetchMetadata(
	client: PublicClient,
	contract: Address,
): Promise<IMetadata | null> {
	const fullMatch = await querySourcify(client, 'full_match', contract);
	if (fullMatch) {
		return fullMatch;
	}
	const partialMatch = await querySourcify(client, 'partial_match', contract);
	if (partialMatch) {
		return partialMatch;
	}
	return await queryEtherscan(client, contract);
}

async function queryEtherscan(
	client: PublicClient,
	contract: Address,
): Promise<IMetadata | null> {
	const chainName = client.chain!.name.toLowerCase();
	if (chainName !== 'celo' && chainName !== 'alfajores') {
		return null;
	}
	const resp = await fetch(
		`https://api${chainName === 'celo' ? '' : `-${chainName}`
		}.celoscan.io/api?module=contract&action=getabi&address=${contract}`,
	);
	if (resp.ok) {
		const json = (await resp.json()) as {
			status: string;
			message: string;
			result: string;
		};
		if (json.status === '1' && json.message === 'OK') {
			const abi = JSON.parse(json.result) as Abi;
			return { abi, contractName: null };
		}
	}
	return null;
}

/**
 * Fetch the sourcify response and instantiate a Metadata wrapper class around it.
 * @param connection @celo/connect instance
 * @param matchType what type of match to query for https://docs.sourcify.dev/docs/full-vs-partial-match/
 * @param contract the address of the contract to query
 * @returns Metadata or null
 */
async function querySourcify(
	client: PublicClient,
	matchType: 'full_match' | 'partial_match',
	contract: Address,
): Promise<IMetadata | null> {
	const chainId = client.chain!.id;
	const resp = await fetch(
		`https://repo.sourcify.dev/contracts/${matchType}/${chainId}/${contract}/metadata.json`,
	);
	let abi: Abi | null = null;
	let contractName: string | null = null;

	if (resp.ok) {
		const metadata = (await resp.json()) as MetadataResponse;

		if (
			typeof metadata === 'object' &&
			typeof metadata.output === 'object' &&
			'abi' in metadata.output &&
			Array.isArray(metadata.output.abi) &&
			metadata.output.abi.length > 0
		) {
			abi = metadata.output.abi;
		}

		if (
			typeof metadata === 'object' &&
			typeof metadata.settings === 'object' &&
			typeof metadata.settings.compilationTarget === 'object' &&
			Object.values(metadata.settings.compilationTarget).length > 0
		) {
			// XXX: Not sure when there are multiple compilationTargets and what should
			// happen then but defaulting to this for now.
			const contracts = Object.values(metadata.settings.compilationTarget);
			contractName = contracts[0];
		}
		if (abi !== null) {
			return { abi, contractName };
		}
	}
	return null;
}

/**
 * Use heuristics to determine if the contract can be a proxy
 * and extract the implementation.
 * Available scenarios:
 * - _getImplementation() exists
 * - getImplementation() exists
 * - _implementation() exists
 * - implementation() exists
 * @param connection @celo/connect instance
 * @param contract the address of the contract to query
 * @returns the implementation address or null
 */
export async function tryGetProxyImplementation(
	client: PublicClient,
	contract: Address,
): Promise<Address | null> {
	const responses = await client.multicall({
		contracts: PROXY_IMPLEMENTATION_GETTERS.map(funcName => ({
			address: contract,
			abi: PROXY_ABI,
			functionName: funcName,
		})),
	});

	const impl = responses.find(r => r.status === 'success');
	if (impl) {
		return impl.result as Address;
	}
	return null;
}

export function tryGetNewProxyImplementation(data: Hex): Address | null {
	for (const humanReadableSetter of PROXY_IMPLEMENTATION_SETTERS) {
		const abiItem = parseAbiItem(humanReadableSetter);
		try {
			const { args } = decodeFunctionData({
				abi: [abiItem],
				data,
			});
			if (args.length > 0) {
				const arg0 = args[0] as string;
				if (isAddress(arg0)) {
					return arg0;
				}
			}
		} catch (e) { }
	}

	return null;
}

export function mapFromPairs<A, B>(pairs: Array<[A, B]>): Map<A, B> {
	const map = new Map<A, B>();
	pairs.forEach(([k, v]) => {
		map.set(k, v);
	});
	return map;
}
