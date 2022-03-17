import React from 'react'
import useStore from 'stores/index';
import Container from 'ui/container';

function App() {
    const { colorScheme, setColorScheme } = useStore();
    return <Container>
        <h1>Hello World!</h1>
        <p>Lorem ipsum dolor sit amet...</p>
        <a href="#" onClick={() => setColorScheme(colorScheme === 'dark' ? 'light': 'dark')}>Change Color Scheme</a>
    </Container>
}

export default App
