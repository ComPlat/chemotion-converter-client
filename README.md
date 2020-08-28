converter-client
================

React client for the [converter-app](https://github.com/ComPlat/converter-app).

Setup
-----

We recomment to use the [nove version manager](https://github.com/nvm-sh/nvm) to install node.js and npm:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
```

After following the instructions in the installation script, `nvm` should be available. The application can then be transpiled using:

```bash
nvm use
npm run build
npm run build:prod  # for the production setup
```


Usage
-----

While developing, the `webpack-dev-server` can be used to update the application on-the-fly:

```bash
npm run serve
```


Deployment
----------

After building the production setup, the files in `public` can be copied to the webserver:

```
nvm use
npm run build:prod
rsync -av public/ user@example.com:/var/www/public/
```
