# SPDX-FileCopyrightText: 2025 IndieHosters <contact@indiehosters.net>
#
# SPDX-License-Identifier: EUPL-1.2

{
  description = "Docs packages";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    treefmt-nix.url = "github:numtide/treefmt-nix";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      treefmt-nix,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        treefmtEval = (treefmt-nix.lib.evalModule pkgs ./treefmt.nix);
      in
      {
        formatter = treefmtEval.config.build.wrapper;
        checks.formatting = treefmtEval.config.build.check self;
        checks.reuse = pkgs.stdenv.mkDerivation {
          name = "reuseTest";
          src = ./.;
          dontBuild = true;
          doCheck = true;
          nativeBuildInputs = [ pkgs.reuse ];
          checkPhase = "reuse lint";
          installPhase = "mkdir $out";
        };

      }
    );
}
