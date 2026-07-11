interface FreighterApi {
  isConnected(): Promise<boolean>;
  getPublicKey(): Promise<string>;
  signAndSubmitXdr(args: {
    xdr: string;
    networkPassphrase?: string;
  }): Promise<{ hash: string; [k: string]: unknown }>;
  signTransaction?(xdr: string, opts: { networkPassphrase?: string }): Promise<string>;
}

interface Window {
  freighter?: FreighterApi;
}
