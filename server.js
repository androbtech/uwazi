require('@babel/register');

require.extensions['.scss'] = function scss() {};
require.extensions['.css'] = function css() {};

require('./app/server.js');
