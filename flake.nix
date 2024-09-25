{
  description = "Lukas Discord Bot";

  inputs = {
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [ inputs.treefmt-nix.flakeModule ];
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
        "x86_64-darwin"
      ];
      perSystem =
        { pkgs, self', ... }:
        let
          node_ver = pkgs.nodejs_20;
        in
        {
          # Per-system attributes can be defined here. The self' and inputs'
          # module parameters provide easy access to attributes of the same
          # system.
          treefmt = {
            projectRootFile = "flake.nix";
            programs = {
              prettier.enable = true;
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
              nixfmt-rfc-style
            ];
          };
          packages = {
            default = pkgs.callPackage ./package.nix { };
            docker = pkgs.dockerTools.buildLayeredImage {
              name = "BlackDemonFire/lukas";
              tag = "latest";
              created = "now";
              config = {
                entrypoint = [
                  "${pkgs.lib.getExe node_ver}"
                  "--enable-source-maps"
                  "${self'.packages.default}/dist/index.js"
                ];
                WorkingDir = self'.packages.default;
              };
            };
          };
          apps.default = {
            type = "app";
            program = "${pkgs.writeScriptBin "lukasbot" ''${pkgs.lib.getExe node_ver} --enable-source-maps ${self'.packages.default}/dist/index.js''}/bin/lukasbot";
          };
          checks = {
            # write a derivation that runs the type checker that runs on `pnpm check`. make sure the pnpm deps are installed. use stdenv.mkDerivation
            type-check =
              let
                pnpmDeps = pkgs.pnpm.fetchDeps {
                  src = ./pnpm-lock.yaml;
                  pname = "lukasbot";
                  version = "0.0.0";
                  hash = "sha256-g7dGb3j8f4bHvenaPPlZtdOs8Kn5VBRXz+LzheXGijw=";
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
                  pkgs.pnpm.configHook
                ];
                # include dependencies from pnpm
                inherit pnpmDeps;
                # install dependencies using pnpm
                preCheck = ''
                  pnpm install
                '';
                checkPhase = ''
                  pnpm check
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
                  ExecStart = "${pkgs.nodejs_20}/bin/node ${self.packages.default}/dist/index.js";
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
