import { getFullnodeUrl } from '@mysten/sui/client';
import { DAO_OBJECT_ID, PACKAGE_ID } from './constant';
import { createNetworkConfig } from '@mysten/dapp-kit';

const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
    testnet: {
        url: getFullnodeUrl('testnet'),
        variables: {
            packageId: PACKAGE_ID,
        },
    },
});

export { useNetworkVariable, useNetworkVariables, networkConfig };