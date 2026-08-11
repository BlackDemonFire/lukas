{
  cacert,
  nodejs_24,
  lib,
  stdenv,
  pnpm,
  pnpmConfigHook,
  fetchPnpmDeps,
  vp,
  ...
}:
let
  node_ver = nodejs_24;
in
stdenv.mkDerivation (finalAttrs: {
  pname = "lukasbot";
  inherit ((builtins.fromJSON (builtins.readFile ./package.json))) version;
  src = lib.cleanSource ./.;
  SSL_CERT_FILE = "${cacert}/etc/ssl/certs/ca-bundle.crt";

  nativeBuildInputs = [
    node_ver
    pnpmConfigHook
    pnpm
    vp
  ];

  pnpmDeps = fetchPnpmDeps {
    inherit (finalAttrs) pname version src;
    installFlags = "--production";
    fetcherVersion = 4;
    hash = "sha256-h7yBdNfLDCq5MmeAMwzeLB9Jq9LXvEfNGJNaqif9fPE=";
  };
  buildPhase = ''
    runHook preBuild
    vp env off
    vp pack
    runHook postBuild
  '';
  installPhase = ''
    runHook preInstall
    mkdir -p $out
    cp -r dist package.json node_modules $out
    runHook postInstall
  '';
})
