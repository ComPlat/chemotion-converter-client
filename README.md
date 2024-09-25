converter-client
================

React client for the [converter-app](https://github.com/ComPlat/chemotion-converter-app).

Development setup
-----------------

We recomment to use the [node version manager](https://github.com/nvm-sh/nvm) to install node.js and npm:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
```

After following the instructions in the installation script, `nvm` should be available. The application can then be transpiled using:

```bash
nvm install
npm install
npm run build
```

While developing, the `webpack-dev-server` can be used to update the application on-the-fly:

```bash
npm run serve
```

Production setup
----------------

For the production setup, the URL of the running [converter-app](https://github.com/ComPlat/chemotion-converter-app) needs to be provided as environment variable:

```bash
nvm use
CONVERTER_APP_URL=https://example.com/api/v1 npm run build:prod
```

After building the production setup, the files in `public` can be copied to the webserver:

```bash
rsync -av public/ user@example.com:/var/www/public/
```

npm package
-----------

For use of components as npm package there is src/bundle.js that can be built using `npm run build:bundle`.

## Acknowledgments

This project has been funded by the **[DFG]**.

[![DFG Logo]][DFG]


Funded by the [Deutsche Forschungsgemeinschaft (DFG, German Research Foundation)](https://www.dfg.de/) under the [National Research Data Infrastructure – NFDI4Chem](https://nfdi4chem.de/) – Projektnummer **441958208** since 2020.


[DFG]: https://www.dfg.de/en/
[DFG Logo]: https://www.dfg.de/zentralablage/bilder/service/logos_corporate_design/logo_negativ_267.png
