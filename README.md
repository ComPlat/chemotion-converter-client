converter-client
================

React client for the [converter-app](https://github.com/ComPlat/converter-app).

Development setup
-----------------

We recomment to use the [nove version manager](https://github.com/nvm-sh/nvm) to install node.js and npm:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
```

After following the instructions in the installation script, `nvm` should be available. The application can then be transpiled using:

```bash
nvm use
npm i
npm run build
```

While developing, the `webpack-dev-server` can be used to update the application on-the-fly:

```bash
npm run serve
```

Production setup
----------------

For the production setup, the URL of the running [converter-app](https://github.com/ComPlat/converter-app) needs to be provided as environment variable:

```bash
nvm use
CONVERTER_APP_URL=https://example.com/api/v1 npm run build:prod
```

After building the production setup, the files in `public` can be copied to the webserver:

```bash
rsync -av public/ user@example.com:/var/www/public/
```
