import { motion } from "framer-motion";

// Page container with transitions

export default function Page({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            className="container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            children={children}
        />
    );
}
