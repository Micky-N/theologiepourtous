const args = process.argv;

/**
 * Parse command line arguments into an options object
 * @type {Object.<string, string>}
 */
const options = {};

args.forEach((arg) => {
    const [key, value] = arg.split('=');
    if (key && value) {
        options[key] = value;
    }
});

/**
 * Base configuration for deployment
 *
 * @param {'development' | 'production'} mode
 *
 * @return {{repo: string, fetch: string, "post-deploy": string}}
 *
 */
function baseConfig(mode) {
    return {
        'repo': 'git@github.com:Micky-N/theologiepourtous.git',
        'fetch': '--all',
        'post-deploy': `cp .env.${mode} .env && npm install`
    };
}

module.exports = {
    // Deployment Configuration
    deploy: {
        development: {
            ...baseConfig('development'),
            user: 'micky',
            host: '212.132.112.230',
            keep_releases: 1,
            ref: 'origin/' + (options.branch || 'develop'),
            path: '/home/micky/theologiepourtous'
        }
    }
};
