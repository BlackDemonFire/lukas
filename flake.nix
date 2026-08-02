{
  description = "Lukas Discord Bot";

  inputs = {
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    nix-vite-plus.url = "github:ryoppippi/nix-vite-plus";
  };

  outputs =
    inputs@{ flake-parts, nix-vite-plus, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [ inputs.treefmt-nix.flakeModule ];
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];
      perSystem =
        {
          pkgs,
          self',
          system,
          ...
        }:
        let
          node_ver = pkgs.nodejs_24;
        in
        {
          # Per-system attributes can be defined here. The self' and inputs'
          # module parameters provide easy access to attributes of the same
          # system.
          treefmt = {
            projectRootFile = "flake.nix";
            programs = {
              nixfmt.enable = true;
              deadnix.enable = true;
              statix.enable = true;
            };
          };
          devShells.default = pkgs.mkShell {
            buildInputs = with pkgs; [
              esbuild
              node_ver
              nil
              pnpm
              nixfmt
              nix-vite-plus.packages.${system}.vp
            ];
          };
          packages = {
            default = pkgs.callPackage ./package.nix {
              inherit (nix-vite-plus.packages.${system}) vp;
            };
            docker = pkgs.dockerTools.buildLayeredImage {
              name = "BlackDemonFire/lukas";
              tag = "latest";
              created = "now";
              config = {
                entrypoint = [
                  "${pkgs.lib.getExe node_ver}"
                  "--enable-source-maps"
                  "${self'.packages.default}/dist/index.mjs"
                ];
                WorkingDir = self'.packages.default;
                Env = [
                  "SSL_CERT_FILE=${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt"
                ];
              };
            };
          };
          apps.default = {
            type = "app";
            program = pkgs.writeShellScriptBin "lukasbot" "${pkgs.lib.getExe node_ver} --enable-source-maps ${self'.packages.default}/dist/index.js";
          };
          checks = {
            # write a derivation that runs the type checker that runs on `pnpm check`. make sure the pnpm deps are installed. use stdenv.mkDerivation
            type-check =
              let
                pnpmDeps = pkgs.fetchPnpmDeps {
                  src = ./pnpm-lock.yaml;
                  pname = "lukasbot";
                  version = "0.0.0";
                  fetcherVersion = 4;
                  hash = "sha256-lI7srhZDXczq2zd3zlh72j8LbW+78CtLYq2fbPZlync=";
                };
              in
              pkgs.stdenv.mkDerivation (_finalAttrs: {
                name = "type-check";
                version = "0.0.0";
                src = pkgs.lib.cleanSource ./.;
                dontBuild = true;
                doCheck = true;
                nativeBuildInputs = [
                  node_ver
                  pkgs.pnpm
                  pkgs.pnpmConfigHook
                ];
                # include dependencies from pnpm
                inherit pnpmDeps;
                # install dependencies using pnpm
                preCheck = ''
                  pnpm install
                '';
                checkPhase = ''
                  pnpm type-check
                '';
                # don't yell about not producing an output path for a check
                installPhase = ''
                  touch $out
                '';
              });
          };
        };
      flake = {
        nixosModules.lukasbot =
          {
            config,
            lib,
            pkgs,
            self,
            ...
          }:
          let
            cfg = config.services.lukasbot;
          in
          {
            options.services.lukasbot = {
              enable = lib.mkOption {
                type = lib.types.bool;
                default = false;
                description = "Enable the Lukas discord bot.";
              };
              envFile = lib.mkOption {
                # optional
                type = lib.types.nullOr lib.types.path;
                default = null;
                description = "Environment file to use for the Lukas bot.";
              };
            };
            config = lib.mkIf cfg.enable {
              systemd.services.lukasbot = {
                description = "Lukas Discord Bot";
                after = [ "network.target" ];
                wantedBy = [ "multi-user.target" ];
                serviceConfig = {
                  ExecStart = "${pkgs.nodejs_24}/bin/node ${self.packages.default}/dist/index.js";
                  Restart = "always";
                  EnvFile = cfg.envFile;
                };
                installWantedBy = [ "multi-user.target" ];
              };
            };
          };
      };
    };
}
