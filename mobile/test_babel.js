const babel = require('@babel/core');
const config = require('./babel.config.js');
console.log("Config:", JSON.stringify(config, null, 2));
try {
  babel.transformSync("const a = 1;", {
    filename: "test.js",
    ...config
  });
  console.log("Babel successful!");
} catch (e) {
  console.error(e);
}
