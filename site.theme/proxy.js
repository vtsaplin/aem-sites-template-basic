const http = require('http');
const url = require('url');
const httpProxy = require('http-proxy');
const fileSystem = require('fs');

const CONFIG = require('./proxy.config.js');

const redirects = {
  [url.parse(CONFIG.url).host]: `http://localhost:${CONFIG.port}`,
  "ims-na1-stg1.adobelogin.com": `http://localhost:${CONFIG.port + 1}`,
  "auth-stg1.services.adobe.com": `http://localhost:${CONFIG.port + 2}`
};

const routeMap = new Map([
  [CONFIG.css.url, CONFIG.css.dist],
  [CONFIG.js.url, CONFIG.js.dist]
]);

function getProxyConfig(target) {
  return {
    target: target,
    secure: false,
    changeOrigin: true,
    autoRewrite: true,
    protocolRewrite: "http",
    cookieDomainRewrite: {
      "*": "localhost"
    }
  };
}

function handleRedirects(proxyRes) {
  if (proxyRes.headers['location']) {
    const parsedUrl = url.parse(proxyRes.headers['location']);
    const redirectHost = redirects[parsedUrl.host];
    if (redirectHost) {
      proxyRes.headers['location'] = redirectHost + parsedUrl.path;
      console.log('Redirecting to ' + proxyRes.headers['location']);
    }
  }
}

function rewriteHostRefererOrigin(proxyReq, target) {
  const host = proxyReq.getHeader('host');
  if (host) {
    console.log('Host: ' + host + "->");
    proxyReq.setHeader('Host', target.host);
    console.log("->" + proxyReq.getHeader('host'));
  }

  // const origin = proxyReq.getHeader('origin');
  // if (origin) {
  //   const parsedUrl = url.parse(origin);
  //   console.log('Origin: ' + origin + "->");

  //   const originalHost = Object.keys(redirects).find(key => redirects[key] === parsedUrl.protocol + '//' + parsedUrl.host);
  //   if (!originalHost) {
  //     throw new Error('No target for ' + parsedUrl.protocol + '//' + parsedUrl.host);
  //   }

  //   proxyReq.setHeader('Origin', 'https://' + originalHost + parsedUrl.path.substr(1));
  //   console.log("->" + proxyReq.getHeader('origin'));
  // }

  const referer = proxyReq.getHeader('referer');
  if (referer) {
    const parsedUrl = url.parse(referer);
    console.log('Referer: ' + referer + "->");

    const originalHost = Object.keys(redirects).find(key => redirects[key] === parsedUrl.protocol + '//' + parsedUrl.host);
    if (!originalHost) {
      throw new Error('No target for ' + parsedUrl.protocol + '//' + parsedUrl.host);
    }

    proxyReq.setHeader('Referer', 'https://' + originalHost + parsedUrl.path.substr(1));
    console.log("->" + proxyReq.getHeader('referer'));
  }
}

function rewriteCookies(proxyRes) {
  if (proxyRes.headers['set-cookie']) {
    proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map(val => val.replace('Secure;', ''))
  }
}

function rewriteProxyRequest(proxyReq, req, res, options) {
  rewriteHostRefererOrigin(proxyReq, options.target)
}

function rewriteProxyResponse(proxyRes, req, res) {
  handleRedirects(proxyRes);
  rewriteCookies(proxyRes);
}

function createProxy(target, callback) {
  const proxy = httpProxy.createProxyServer(getProxyConfig(target));
  proxy.on('proxyReq', rewriteProxyRequest);
  proxy.on('proxyRes', rewriteProxyResponse);
  return http.createServer((req, res) => {
    if (callback) callback(req, res);
    proxy.web(req, res);
  });
}

function replaceResources(req, res) {
  for (let [key, value] of routeMap) {
    if (req.url.match(key)) {
      fileSystem.createReadStream(value).pipe(res);
    }
  }
}

createProxy(CONFIG.url, replaceResources).listen(CONFIG.port);
createProxy("https://ims-na1-stg1.adobelogin.com").listen(CONFIG.port + 1);
createProxy("https://auth-stg1.services.adobe.com").listen(CONFIG.port + 2);

console.log(`Go to http://localhost:${CONFIG.port} to see your live preview.`);
