import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { ProposalService } from '../services/proposals.js';
import { TransactionsService } from '../services/transactions.js';
import { GovernanceService } from '../services/governance.js';
import { usePublicClient } from 'wagmi';
import { logger } from '../utils/logger.js';

const DEFAULT = (() => {
	const proposal = new ProposalService();
	return {
		proposal,
		transactions: new TransactionsService(proposal),
		governance: new GovernanceService(),
		initialized: false,
	};
})();

export type Services = typeof DEFAULT;
export const ServiceContext = createContext<Services>(DEFAULT);

export const useServices = () => {
	const { proposal, transactions, governance, initialized } =
		useContext(ServiceContext);
	return { proposal, transactions, governance, initialized };
};

export const ServiceProvider = ({ children }: any) => {
	const services = useMemo(() => ({ ...DEFAULT }), []);
	const [initialized, setInitialized] = React.useState(false);
	const client = usePublicClient();

	useEffect(() => {
		(async client => {
			logger.debug('Initializing services');
			await Promise.all([
				services.proposal.init(client),
				services.transactions.init(client),
				services.governance.init(client),
			]);
			setInitialized(true);
			logger.debug('Services initialized');
		})(client);
	}, [client, services]);

	const value = {
		...services,
		initialized,
	};

	return (
		<ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>
	);
};
