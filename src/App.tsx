import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { AnimatePresence } from "framer-motion";
import { QueryClient, QueryClientProvider } from 'react-query';
import { createWebStoragePersistor } from 'react-query/createWebStoragePersistor-experimental';
import { persistQueryClient } from 'react-query/persistQueryClient-experimental';

import useStore from 'stores/index';
import useMessageStore from 'stores/messages';

import HomePage from 'pages/home';
import ConnectPage from 'pages/connect';
import AccountPage from 'pages/account';
import DropsPage from 'pages/drops';
import CollectionsPage from 'pages/collections';
import ProfilePage from 'pages/profile';
import DropDetailPage from 'pages/drop-detail';
import TokenPage from 'pages/token';

import Messages from 'ui/messages';
import ScrollToTop from 'ui/scroll-to-top';
import Modal from 'ui/modal';

import { deserialize, serialize } from 'util/serialize';


// This query agent does the heavy lifting for querying, caching and persisting data from backend canisters.
export const queryClient = new QueryClient()
const localStoragePersistor = createWebStoragePersistor({ storage: window.localStorage, serialize, deserialize });
persistQueryClient({
    queryClient,
    persistor: localStoragePersistor,
});


function App() {
    const { init } = useStore();
    const { init: initMessageStore } = useMessageStore();
    React.useEffect(() => {
        init();
        initMessageStore();
    }, []);
    return <>
        <QueryClientProvider client={queryClient}>
            <AnimatePresence exitBeforeEnter>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/connect" element={<ConnectPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/drops/:canister/:index">
                        <Route index element={<DropDetailPage />} />
                        <Route path="mints" element={<DropDetailPage />} />
                        <Route path="transfers" element={<DropDetailPage />} />
                    </Route>
                    <Route path="/drops" element={<DropsPage />} />
                    <Route path="/token/:identifier" element={<TokenPage />} />
                    <Route path="/collection/:canister" element={<CollectionsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Routes>
            </AnimatePresence>
            <Messages />
            <ScrollToTop />
            <Modal />
        </QueryClientProvider>
    </>
}

export default App
