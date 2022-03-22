import React from 'react'
import { Leva } from 'leva';
// import useStore from 'stores/index';
import { Route, Routes } from 'react-router-dom';
import HomePage from 'pages/home';
import ConnectPage from 'pages/connect';
import AccountPage from 'pages/account';
import DropsPage from 'pages/drops';
import CollectionsPage from 'pages/collections';
import ProfilePage from 'pages/profile';
import DropDetailPage from 'pages/drop-detail';
import Messages from 'ui/messages';

function App() {
    // const { isLocal } = useStore();
    return <>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/connect" element={<ConnectPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/drops/:slug" element={<DropDetailPage />} />
            <Route path="/drops" element={<DropsPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
        </Routes>
        <Leva hidden={true} collapsed />
        <Messages />
    </>
}

export default App
