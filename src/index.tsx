#!/usr/bin/env node

import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { makeConfig } from './utils/wagmiConfig.js';
import { AddressBookProvider } from './providers/AddressBookProvider.js';
import { App } from './app.js';
import { ServiceProvider } from './providers/ServiceProvider.js';

const cli = meow(
	`
	Usage
	  $ cgp-viewer <proposal-id> [options]

	Options
		--chain, -c   celo|alfajores|baklava (default: celo)
		--node, -n    <nodeURL> (overrides the default for the chain)

	Examples
	  $ cgp-viewer 114
`,
	{
		importMeta: import.meta,
		flags: {
			chain: {
				type: 'string',
				choices: ['celo', 'alfajores', 'baklava'],
				shortFlag: 'c',
				default: 'celo',
			},
			node: {
				type: 'string',
				shortFlag: 'n',
			},
		},
	},
);

const queryClient = new QueryClient();

type Flags = {
	chain: 'celo' | 'alfajores' | 'baklava';
	node?: string;
};

const flags: Flags = cli.flags as Flags;

const proposalId = parseInt(cli.input.at(0) || '');

render(
	<QueryClientProvider client={queryClient}>
		<WagmiProvider config={makeConfig(flags.chain, flags.node)}>
			<AddressBookProvider>
				<ServiceProvider>
					<App id={proposalId} />
				</ServiceProvider>
			</AddressBookProvider>
		</WagmiProvider>
	</QueryClientProvider>,
);
