# ORKA — Soroban smart contracts
# Run `make test` from this directory to exercise the escrow contract.

.PHONY: default all test build fmt clean

default: build

all: test

test:
	cargo test

build:
	stellar contract build
	@ls -l target/wasm32v1-none/release/*.wasm

fmt:
	cargo fmt --all

clean:
	cargo clean
