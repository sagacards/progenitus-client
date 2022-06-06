const path = require('path');
const { loadConfigFromFile, mergeConfig } = require('vite');
const react = require('@vitejs/plugin-react').default;
const tsconfigPaths = require('vite-tsconfig-paths').default;

module.exports = {
    stories: ['../src/**/*.stories.mdx', '../src/**/*stories.@(js|jsx|ts|tsx)'],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
        'storybook-css-modules-preset',
    ],
    framework: '@storybook/react',
    core: {
        builder: '@storybook/builder-vite',
    },
    async viteFinal(config) {
        const { config: userConfig } = await loadConfigFromFile(
            path.resolve(__dirname, '../vite.config.ts')
        );
        return mergeConfig(config, {
            ...userConfig,
            define: {
                ...config.define,
                global: 'window',
            },
            esbuild: {
                ...config.esbuild,
            },
            features: {
                interactionsDebugger: true,
            },
            // manually specify plugins to avoid conflict
            plugins: [tsconfigPaths()],
        });
    },
};
