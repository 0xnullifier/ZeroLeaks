import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"

interface ThankYouComponentProps {
    onRedirect?: () => void
    redirectUrl?: string
    countdownSeconds?: number
    title?: string
    subtitle?: string
    redirectText?: string
}

export function ThankYouComponent({
    onRedirect,
    redirectUrl = "/leaks",
    countdownSeconds = 5,
    title = "Thank You for Submitting!",
    subtitle = "You leak has been successfully submitted and verified.",
    redirectText = "Redirecting you to leaks",
}: ThankYouComponentProps) {
    const [countdown, setCountdown] = useState(countdownSeconds)

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    if (onRedirect) {
                        onRedirect()
                    } else if (typeof window !== "undefined") {
                        window.location.href = redirectUrl
                    }
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [onRedirect, redirectUrl])

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center space-y-6">
                    {/* Animated Glowing Checkmark */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                            delay: 0.2
                        }}
                        className="flex justify-center"
                    >
                        <motion.div
                            animate={{
                                boxShadow: [
                                    "0 0 20px rgba(34, 197, 94, 0.3)",
                                    "0 0 40px rgba(34, 197, 94, 0.6)",
                                    "0 0 20px rgba(34, 197, 94, 0.3)",
                                ]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="rounded-full bg-green-500 p-4"
                        >
                            <CheckCircle className="w-16 h-16 text-white" />
                        </motion.div>
                    </motion.div>

                    {/* Success Message */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="space-y-2"
                    >
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {title}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            {subtitle}
                        </p>
                    </motion.div>

                    {/* Animated Success Indicators */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="space-y-3"
                    >
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 1, duration: 0.4 }}
                            className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5, delay: 1.2 }}
                                className="w-2 h-2 bg-green-500 rounded-full"
                            />
                            <span>Proof verified successfully</span>
                        </motion.div>

                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.4 }}
                            className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5, delay: 1.4 }}
                                className="w-2 h-2 bg-green-500 rounded-full"
                            />
                            <span>Data submitted to blockchain</span>
                        </motion.div>

                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 1.4, duration: 0.4 }}
                            className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5, delay: 1.6 }}
                                className="w-2 h-2 bg-green-500 rounded-full"
                            />
                            <span>Transaction confirmed</span>
                        </motion.div>
                    </motion.div>

                    {/* Countdown and Redirect */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.8, duration: 0.6 }}
                        className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                    >
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            {redirectText}
                        </p>

                        {/* Animated Countdown */}
                        <motion.div
                            key={countdown}
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="relative"
                        >
                            <div className="text-4xl font-bold text-gray-900 dark:text-white">
                                {countdown}
                            </div>

                            {/* Circular Progress Ring */}
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center"
                                initial={{ rotate: 0 }}
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 1,
                                    repeat: countdown,
                                    ease: "linear"
                                }}
                            >
                                <svg className="w-16 h-16 -rotate-90">
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        fill="none"
                                        className="text-gray-200 dark:text-gray-700"
                                    />
                                    <motion.circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        fill="none"
                                        className="text-green-500"
                                        strokeLinecap="round"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: (countdownSeconds - countdown) / countdownSeconds }}
                                        transition={{ duration: 0.5 }}
                                        style={{
                                            strokeDasharray: "175.929",
                                            strokeDashoffset: "175.929",
                                        }}
                                    />
                                </svg>
                            </motion.div>
                        </motion.div>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            You will be automatically redirected
                        </p>
                    </motion.div>
                </CardContent>
            </Card>
        </div>
    )
}
