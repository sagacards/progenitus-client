import React from 'react'
import { Leva } from 'leva';
import useStore from 'stores/index';
import Navbar from 'ui/navbar';
import { Route, Routes } from 'react-router-dom';
import HomePage from 'pages/home';
import Footer from 'ui/footer';

function App() {
    const { isLocal } = useStore();
    return <div>
        <Navbar />
        <Routes>
            <Route path="/" element={<HomePage />} />
        </Routes>
        <Footer />
        <Leva hidden={!isLocal} collapsed />
    </div>
}

export default App
