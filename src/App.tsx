import React from 'react'
import { Route, Routes } from 'react-router-dom';
import HomePage from 'pages/home';
import ConnectPage from 'pages/connect';
import AccountPage from 'pages/account';
import DropsPage from 'pages/drops';
import CollectionsPage from 'pages/collections';
import ProfilePage from 'pages/profile';
import DropDetailPage from 'pages/drop-detail';
import Messages from 'ui/messages';
import useStore from './stores';
import ScrollToTop from 'ui/scroll-to-top';
import { useTokenStore } from 'stores/tokens';
import Modal from 'ui/modal';

function App() {
    const { init, pushMessage } = useStore();
    const { capFetchRoots } = useTokenStore();
    React.useEffect(() => {
        capFetchRoots();
        init();
    }, []);
    return <>
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
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
        </Routes>
        <Messages />
        <ScrollToTop />
        <Modal />
    </>
}

export default App
