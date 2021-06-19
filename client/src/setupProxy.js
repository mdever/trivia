var proxy = require('http-proxy-middleware');

module.exports =  function(app) {
    if (process.env.NODE_ENV === 'development') {
        console.log('detected we\'re in dev mode. proxying api requests from localhost:3000 to localhost:8080');
        const devAppProxy = proxy.createProxyMiddleware({
            target: 'http://localhost:8080',
            changeOrigin: true,
            ws: true,
        });
        const devWsProxy = proxy.createProxyMiddleware({
            target: 'ws://localhost:8080/ws',
            changeOrigin: true,
            ws: true
        });
        app.use('/api', devAppProxy);
        app.use('/ws', devWsProxy);
    }
}