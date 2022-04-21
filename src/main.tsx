import React from 'react'
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/uncial-antiqua'
import '@fontsource/almendra'
import '@fontsource/almendra-sc'
import '@fontsource/space-mono'
import '@fontsource/inter/400.css'
import '@fontsource/inter/variable.css'
import './index.css'
import 'react-toastify/dist/ReactToastify.css'
import App from './App'

const container = document.getElementById('root') as HTMLDivElement;
const root = createRoot(container);
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)
