import React from 'react'
import { Leva } from 'leva';
import useStore from 'stores/index';
import { Route, Routes } from 'react-router-dom';
import HomePage from 'pages/home';
import ConnectPage from 'pages/connect';

function App() {
    const { isLocal } = useStore();
    return <>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/connect" element={<ConnectPage />} />
        </Routes>
        <Leva hidden={true} collapsed />
    </>
}

export default App
