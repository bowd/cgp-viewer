import {
	Abi,
	AbiFunction,
	Address,
	PublicClient,
	decodeFunctionData,
	encodeFunctionData,
	parseAbiItem,
} from 'viem';
import { ITransaction, IProposal } from './proposals.js';
import {
	IMetadata,
	fetchMetadata,
	tryGetNewProxyImplementation,
	tryGetProxyImplementation,
} from '../utils/sourcify.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';
import path from 'node:path';
import paths from '../utils/paths.js';

export type IParsedTransaction =
	| {
		parsed: true;
		signature: string;
		index: number;
		raw: ITransaction;
		to: {
			address: Address;
			name: string;
			isProxy: boolean;
			implementation?: Address;
		};
		value: bigint;
		functionName: string;
		abi: AbiFunction;
		args: unknown[];
	}
	| {
		parsed: false;
		index: number;
		raw: ITransaction;
	};

interface FourBytesResponse {
	count: number;
	results: Array<{
		id: number;
		text_signature: string;
		hex_signature: string;
	}>;
}

class TransactionsService {
	client: PublicClient | null = null;
	transactionsCache: Map<number, IParsedTransaction[]> = new Map();
	isLoading: Set<number> = new Set();
	promises: Map<number, Promise<IParsedTransaction[]>> = new Map();
	abis: Map<Address, AbiFunction[]> = new Map();
	contractNames: Map<Address, string> = new Map();
	isProxy: Set<Address> = new Set();
	proxyToImplementations: Map<Address, Address[]> = new Map();

	async init(client: PublicClient) {
		this.client = client;
	}

	parse(proposal: IProposal): IParsedTransaction[] {
		if (this.transactionsCache.has(proposal.id)) {
			return this.transactionsCache.get(proposal.id)!;
		}
		if (this.isLoading.has(proposal.id)) {
			throw this.promises.get(proposal.id)!;
		}

		const promise = new Promise<IParsedTransaction[]>(
			async (resolve, reject) => {
				try {
					const txs = await this.handleParse(proposal);
					this.transactionsCache.set(proposal.id, txs);
					resolve(txs);
				} catch (e) {
					logger.error('Failed to parse transactions', e);
					// Todo Handle error better
					reject(e);
				} finally {
					this.promises.delete(proposal.id);
					this.isLoading.delete(proposal.id);
				}
			},
		);

		this.promises.set(proposal.id, promise);
		this.isLoading.add(proposal.id);

		throw promise;
	}

	async handleParse(proposal: IProposal): Promise<IParsedTransaction[]> {
		logger.info('Parsing transactions for', proposal.id);
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

export const transactionsService = new TransactionsService();
