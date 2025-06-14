import { useCallback } from 'react';
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { DAO_OBJECT_ID, LEAKS_OBJECT_ID, BOUNTIES_OBJECT_ID, PACKAGE_ID } from "@/lib/constant";
import { useLeaksStore } from "@/lib/leaks-store";
import { useBountyStore } from "@/lib/bounty-store";

/**
 * Hook that provides centralized refetch functions for all major objects
 * Use this after any submission or transaction to keep data in sync
 */
export function useRefetchAll() {
    const currentAccount = useCurrentAccount();
    const { fetchLeaks } = useLeaksStore();
    const { fetchBounties } = useBountyStore();

    // Fetch DAO object data
    const { data: daoData, refetch: refetchDao } = useSuiClientQuery(
        "getObject",
        {
            id: DAO_OBJECT_ID,
            options: {
                showContent: true,
                showType: true,
            },
        },
        {
            enabled: !!DAO_OBJECT_ID,
        }
    );

    // Fetch leaks data
    const { data: leaksData, refetch: refetchLeaksData } = useSuiClientQuery(
        "getObject",
        {
            id: LEAKS_OBJECT_ID,
            options: {
                showContent: true,
                showDisplay: true,
            },
        },
        {
            enabled: !!LEAKS_OBJECT_ID,
        }
    );

    // Fetch bounties data
    const { data: bountiesData, refetch: refetchBountiesData } = useSuiClientQuery(
        "getObject",
        {
            id: BOUNTIES_OBJECT_ID,
            options: {
                showContent: true,
                showType: true,
            },
        },
        {
            enabled: !!BOUNTIES_OBJECT_ID,
        }
    );

    // Fetch ZL_DAO token balance
    const { data: zlTokenBalance, refetch: refetchZlBalance } = useSuiClientQuery(
        "getBalance",
        {
            owner: currentAccount?.address!,
            coinType: `${PACKAGE_ID}::zl_dao::ZL_DAO`,
        },
        {
            enabled: !!currentAccount?.address,
        }
    );

    // Fetch SUI balance
    const { data: suiBalance, refetch: refetchSuiBalance } = useSuiClientQuery(
        "getBalance",
        {
            owner: currentAccount?.address!,
            coinType: "0x2::sui::SUI",
        },
        {
            enabled: !!currentAccount?.address,
        }
    );

    // Centralized refetch function for all balances
    const refetchBalances = useCallback(async () => {
        const promises = [];
        if (currentAccount?.address) {
            promises.push(refetchZlBalance());
            promises.push(refetchSuiBalance());
        }
        if (promises.length > 0) {
            await Promise.all(promises);
        }
    }, [currentAccount?.address, refetchZlBalance, refetchSuiBalance]);

    // Refetch all object data (DAO, leaks, bounties)
    const refetchObjectData = useCallback(async () => {
        const promises = [
            refetchDao(),
            refetchLeaksData(),
            refetchBountiesData(),
        ];

        const [newDaoData, newLeaksData, newBountiesData] = await Promise.all(promises);

        // Update store data with fresh data
        if (newLeaksData) {
            fetchLeaks(newLeaksData);
        }
        if (newBountiesData) {
            fetchBounties(newBountiesData);
        }

        return { newDaoData, newLeaksData, newBountiesData };
    }, [refetchDao, refetchLeaksData, refetchBountiesData, fetchLeaks, fetchBounties]);

    // Master refetch function that updates everything
    const refetchAll = useCallback(async () => {
        console.log('🔄 Refetching all data after submission...');
        try {
            await Promise.all([
                refetchObjectData(),
                refetchBalances(),
            ]);
            console.log('✅ All data refetched successfully');
        } catch (error) {
            console.error('❌ Error refetching data:', error);
            throw error;
        }
    }, [refetchObjectData, refetchBalances]);

    return {
        // Individual refetch functions
        refetchDao,
        refetchLeaksData,
        refetchBountiesData,
        refetchZlBalance,
        refetchSuiBalance,

        // Grouped refetch functions
        refetchBalances,
        refetchObjectData,

        // Master refetch function
        refetchAll,

        // Current data (optional, for convenience)
        daoData,
        leaksData,
        bountiesData,
        zlTokenBalance,
        suiBalance,
    };
}
