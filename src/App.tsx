import { Leva } from 'leva';
import React from 'react'
import useStore from 'stores/index';
import Container from 'ui/container';
import Navbar from 'ui/navbar';
import SchemeToggle from 'ui/scheme-toggle';

function App() {
    const { colorScheme, setColorScheme, isLocal } = useStore();
    return <Container>
        <Navbar />
        <h1>Hello World!</h1>
        <p>Lorem ipsum dolor sit amet...</p>
        <Leva hidden={!isLocal} collapsed />
    </Container>
}

export default App
