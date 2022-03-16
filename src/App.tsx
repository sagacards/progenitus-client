import React from 'react'
import useStore from 'stores/index';

function App() {
    const { colorScheme, setColorScheme } = useStore();
    return <div>
        <h1>Hello World!</h1>
        <p>Lorem ipsum dolor sit amet...</p>
        <a href="#" onClick={() => setColorScheme(colorScheme === 'dark' ? 'light': 'dark')}>Change Color Scheme</a>
    </div>
}

export default App
