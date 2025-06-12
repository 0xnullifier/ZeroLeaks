import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, TrendingUp, Wallet, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface TokenBalanceProps {
    balance: number;
}

export function TokenBalance({ balance }: TokenBalanceProps) {
    const formatBalance = (amount: number) => {
        if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `${(amount / 1000).toFixed(1)}K`;
        }
        return amount.toLocaleString();
    };

    const getBalanceStatus = (balance: number) => {
        if (balance >= 10000) return { status: "high", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-950/20" };
        if (balance >= 1000) return { status: "medium", color: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-950/20" };
        if (balance > 0) return { status: "low", color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-950/20" };
        return { status: "none", color: "text-gray-600", bgColor: "bg-gray-50 dark:bg-gray-950/20" };
    };

    const getVotingPower = (balance: number) => {
        if (balance >= 10000) return "High";
        if (balance >= 1000) return "Medium";
        if (balance > 0) return "Low";
        return "None";
    };

    const balanceStatus = getBalanceStatus(balance);
    const votingPower = getVotingPower(balance);

    return (
        <Card className={`${balanceStatus.bgColor} border-2 transition-all duration-200 hover:shadow-md`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your DAO Tokens</CardTitle>
                <Coins className={`h-4 w-4 ${balanceStatus.color}`} />
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-1">
                    <motion.div
                        className={`text-2xl font-bold ${balanceStatus.color}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {formatBalance(balance)}
                    </motion.div>
                    <p className={`text-xs ${balanceStatus.color.replace('600', '500')}`}>
                        {balance.toLocaleString()} ZL
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Voting Power</span>
                    <Badge
                        variant="outline"
                        className={`text-xs ${votingPower === "High" ? "border-green-500 text-green-700 bg-green-50 dark:bg-green-950/20" :
                            votingPower === "Medium" ? "border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/20" :
                                votingPower === "Low" ? "border-red-500 text-red-700 bg-red-50 dark:bg-red-950/20" :
                                    "border-gray-500 text-gray-700 bg-gray-50 dark:bg-gray-950/20"
                            }`}
                    >
                        {votingPower}
                    </Badge>
                </div>

                {balance === 0 && (
                    <div className="space-y-2 pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                            You need DAO tokens to participate in governance.
                        </p>
                        <Button size="sm" variant="outline" className="w-full text-xs">
                            <Wallet className="h-3 w-3 mr-1" />
                            Get Tokens
                        </Button>
                    </div>
                )}

                {balance > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                        <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex justify-between">
                                <span>Min. vote amount:</span>
                                <span className="font-medium">1 token</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Available to vote:</span>
                                <span className="font-medium">{balance.toLocaleString()}</span>
                            </div>
                        </div>

                        <Button size="sm" variant="outline" className="w-full text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            View Portfolio
                            <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
