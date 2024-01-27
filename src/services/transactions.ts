import {
	Abi,
	AbiFunction,
	Address,
	PublicClient,
	decodeFunctionData,
	encodeFunctionData,
	parseAbiItem,
} from 'viem';
import { ProposalService } from './proposals.js';
import {
	IMetadata,
	fetchMetadata,
	tryGetNewProxyImplementation,
	tryGetProxyImplementation,
} from '../utils/sourcify.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';
import paths from '../utils/paths.js';
import { CollectionLoaderService } from './service.js';
import { IParsedTransaction, ITransaction } from './types.js';

interface FourBytesResponse {
	count: number;
	results: Array<{
		id: number;
		text_signature: string;
		hex_signature: string;
	}>;
}

export class TransactionsService extends CollectionLoaderService<
	number,
	IParsedTransaction[]
> {
	client: PublicClient | null = null;
	abis: Map<Address, AbiFunction[]> = new Map();
	contractNames: Map<Address, string> = new Map();
	isProxy: Set<Address> = new Set();
	proxyToImplementations: Map<Address, Address[]> = new Map();
	proposalService: ProposalService;

	constructor(proposalService: ProposalService) {
		super();
		this.proposalService = proposalService;
	}

	async init(client: PublicClient) {
		this.client = client;
	}

	async handleLoad(id: number): Promise<IParsedTransaction[]> {
		const proposal = await this.proposalService.load(id);
		logger.info(['Parsing transactions for', id]);
		await Promise.all(proposal.transactions.map(tx => this.loadAbis(tx)));
		return Promise.all(
			proposal.transactions.map((tx, index) =>
				this.parseTransaction(tx, index),
			),
		);
	}

	async loadMetadata(contract: Address) {
		let metadata: IMetadata | null = null;
		const metadataFile = paths.matadataFile(this.client!.chain!.id, contract);

		if (fs.existsSync(metadataFile)) {
			metadata = JSON.parse(
				fs.readFileSync(metadataFile).toString(),
			) as IMetadata;
		} else {
			metadata = await fetchMetadata(this.client!, contract);
			if (metadata) {
				fs.writeFileSync(metadataFile, JSON.stringify(metadata));
			}
		}

		if (metadata) {
			this.abis.set(
				contract,
				metadata.abi.filter(item => item.type === 'function') as AbiFunction[],
			);
			if (metadata.contractName) {
				this.contractNames.set(contract, metadata.contractName);
			}
		}
	}

	async loadAbis(tx: ITransaction) {
		await this.loadMetadata(tx.to);

		if (this.isProxy.has(tx.to) === false) {
			const proxyImplementation = await tryGetProxyImplementation(
				this.client!,
				tx.to,
			);
			if (proxyImplementation !== null) {
				this.isProxy.add(tx.to);
				const implementations = this.proxyToImplementations.get(tx.to) || [];
				await this.loadMetadata(proxyImplementation);
				this.proxyToImplementations.set(tx.to, [
					...implementations,
					proxyImplementation,
				]);
			}
		}

		const newImplementation = tryGetNewProxyImplementation(tx.data);
		if (newImplementation !== null) {
			await this.loadMetadata(newImplementation);
		}
	}

	async parseTransaction(
		tx: ITransaction,
		index: number,
	): Promise<IParsedTransaction> {
		let parsedTx = await this.tryParseFromAbis(tx, index);
		if (parsedTx !== null) {
			return parsedTx;
		}
		parsedTx = await this.tryParseFrom4bytesDir(tx, index);
		if (parsedTx !== null) {
			return parsedTx;
		}
		return {
			index,
			parsed: false,
			raw: tx,
		};
	}

	async tryParseFrom4bytesDir(
		tx: ITransaction,
		index: number,
	): Promise<IParsedTransaction | null> {
		const signature = tx.data.slice(0, 10);
		const resp = (await fetch(
			`https://www.4byte.directory/api/v1/signatures/?hex_signature=${signature}&format=json`,
		).then(resp => resp.json())) as FourBytesResponse;

		for (const result of resp.results) {
			try {
				const abiItem = parseAbiItem(`function ${result.text_signature}`);
				const { args, functionName } = decodeFunctionData({
					abi: [abiItem],
					data: tx.data,
				});

				return {
					signature,
					parsed: true,
					index,
					raw: tx,
					to: {
						address: tx.to,
						name: this.contractNames.get(tx.to) || '',
						isProxy: false,
					},
					value: tx.value,
					functionName,
					abi: abiItem as AbiFunction,
					args: [...args],
				};
			} catch (e) { }
		}

		return null;
	}

	async tryParseFromAbis(
		tx: ITransaction,
		index: number,
	): Promise<IParsedTransaction | null> {
		const signature = tx.data.slice(0, 10);
		const abis = [tx.to, ...(this.proxyToImplementations.get(tx.to) || [])]
			.map(contract => this.abis.get(contract))
			.filter(Boolean) as AbiFunction[][];

		try {
			const { functionName, args } = decodeFunctionData({
				abi: abis.flat(),
				data: tx.data,
			});
			return {
				parsed: true,
				signature,
				index,
				raw: tx,
				to: {
					address: tx.to,
					name: this.contractNames.get(tx.to) || '',
					isProxy: this.isProxy.has(tx.to),
					implementation: this.proxyToImplementations.get(tx.to)?.[0],
				},
				value: tx.value,
				functionName,
				abi: abis
					.flat()
					.filter(item => item.name === functionName)
					.find(item => {
						return (
							encodeFunctionData({
								abi: [item],
								functionName,
								args,
							}) === tx.data
						);
					})!,
				args: [...args],
			};
		} catch (e) {
			return null;
		}
	}
}
