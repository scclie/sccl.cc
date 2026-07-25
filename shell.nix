{ pkgs ? import <nixpkgs> {} }:

let
  zine = pkgs.stdenv.mkDerivation {
    pname = "zine";
    version = "0.11.3";

    src = pkgs.fetchurl {
      url = "https://github.com/kristoff-it/zine/releases/download/v0.11.3/x86_64-linux-musl.tar.xz";
      sha256 = "c25e5372b8a5d2759f2b7e581aefb90c8019ff0056a230a97efe3c8edab3bc19";
    };

    unpackPhase = ''
      tar xf $src
    '';

    installPhase = ''
      mkdir -p $out/bin
      cp zine $out/bin/zine
      chmod +x $out/bin/zine
    '';
  };
in
pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs
    zine
  ];

  shellHook = ''
    echo "Zine $(zine --version 2>/dev/null || echo 'v0.13.0') + Node.js $(node --version) ready"
  '';
}
