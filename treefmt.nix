# SPDX-FileCopyrightText: 2025 IndieHosters <contact@indiehosters.net>
#
# SPDX-License-Identifier: EUPL-1.2

{ pkgs, ... }:
{
  projectRootFile = "treefmt.nix";
  settings.global.excludes = [ "pkg/adalovelace/templates/*" ];
  # settings.formatter.yamlfmt.excludes = [ "pkg/adalovelace/templates/*" ];

  programs.nixfmt.enable = true;
  programs.gofmt.enable = true;
  programs.yamlfmt.enable = true;
  programs.yamlfmt.settings.formatter = {
    include_document_start = true;
    indentless_arrays = true;
    max_line_length = 80;
  };
  programs.mdformat.enable = true;
  programs.cue.enable = true;
  programs.formatjson5.enable = true;
  programs.jsonfmt.enable = true;
  programs.toml-sort.enable = true;
  # programs.shellcheck.enable = true;
}
