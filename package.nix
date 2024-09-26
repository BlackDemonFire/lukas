{
  esbuild,
  nodejs,
  pnpm,
  lib,
  stdenv,
  ...
}:
let
  node_ver = nodejs;
in
stdenv.mkDerivation (finalAttrs: {
  pname = "lukasbot";
  inherit ((builtins.fromJSON (builtins.readFile ./package.json))) version;
  src = lib.cleanSource ./.;

  nativeBuildInputs = [
    esbuild
    node_ver
    pnpm.configHook
  ];

  pnpmDeps = pnpm.fetchDeps {
    inherit (finalAttrs) pname version src;
    installFlags = "--production";
    hash = "sha256-u/QK1sKmUCRSkMaiia3picNL2A4zt7JTF3WCnPMflS4=";
  };
  buildPhase = ''
    runHook preBuild
    esbuild  "src/**/*.ts" --outdir=dist --format=esm --platform=node --tsconfig=tsconfig.json --minify
    runHook postBuild
  '';
  installPhase = ''
    runHook preInstall
    mkdir -p $out
    cp -r dist package.json node_modules languages drizzle drizzle.config.js $out
    runHook postInstall
  '';
})
