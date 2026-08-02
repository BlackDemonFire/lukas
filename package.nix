{
  esbuild,
  nodejs_24,
  lib,
  stdenv,
  pnpm,
  pnpmConfigHook,
  fetchPnpmDeps,
  ...
}:
let
  node_ver = nodejs_24;
in
stdenv.mkDerivation (finalAttrs: {
  pname = "lukasbot";
  inherit ((builtins.fromJSON (builtins.readFile ./package.json))) version;
  src = lib.cleanSource ./.;

  nativeBuildInputs = [
    esbuild
    node_ver
    pnpmConfigHook
    pnpm
  ];

  pnpmDeps = fetchPnpmDeps {
    inherit (finalAttrs) pname version src;
    installFlags = "--production";
    fetcherVersion = 4;
    hash = "sha256-bl9vjrojPPjEhJKPbzwEMa6DxBPw8/dWySYXa6/E/kk=";
  };
  buildPhase = ''
    runHook preBuild
    esbuild  "src/**/*.ts" --outdir=dist --format=esm --platform=node --tsconfig=tsconfig.json --minify
    runHook postBuild
  '';
  installPhase = ''
    runHook preInstall
    mkdir -p $out
    cp -r dist package.json node_modules languages $out
    runHook postInstall
  '';
})
