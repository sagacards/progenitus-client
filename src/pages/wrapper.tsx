import React from 'react';
import { motion } from "framer-motion";
import { ErrorBoundary } from 'react-error-boundary'
import { Navigate } from 'react-router-dom';

// Page container with transitions

export default function Page({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary fallback={<Error />} children={
            <motion.div
                className="container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                children={children}
            />
        } />
    );
}

export function Error() {
    React.useEffect(() => alert('Whoops! An error occured'), []);
    return <Navigate to="/" />
}

export function NotFound() {
    React.useEffect(() => alert('Whoops! Could not find that page'), []);
    return <Navigate to="/" />
}