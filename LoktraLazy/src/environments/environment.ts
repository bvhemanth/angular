// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  apiMainPoint: "https://"+window.location.host.split('/')[0]+'/',/*"https://"+window.location.host.split('/')[0]+'/',window.location.host.split('.')[0] https://loktra.loktra.com/*/
  apiBasePoint:'api/v2/',
  GoogleApiKey:'AIzaSyB-dsc8GM1LtnQEjs9RZVgZzRGyPQ2bMQw'
};
