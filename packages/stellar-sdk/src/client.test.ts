import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createOrkaClient } from './client';

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as Response;
}

describe('createOrkaClient', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('Mode A fundEscrow returns txHash and posts mode=orka', async () => {
    fetchMock.mockImplementation(async () => jsonResponse({ tx_hash: 'hash123' }));
    const client = createOrkaClient({
      baseUrl: 'http://localhost:3000',
      mode: 'orka',
    });
    const res = await client.fundEscrow({ contractId: 'C123', milestoneIds: [0] });
    expect(res).toEqual({ txHash: 'hash123' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:3000/escrow/fund');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toMatchObject({
      mode: 'orka',
      contract_id: 'C123',
      milestone_ids: [0],
    });
  });

  it('Mode B fundEscrow returns txXdr and posts mode=freighter', async () => {
    fetchMock.mockImplementation(async () => jsonResponse({ tx_xdr: 'xdr456' }));
    const client = createOrkaClient({
      baseUrl: 'http://localhost:3000',
      mode: 'freighter',
    });
    const res = await client.fundEscrow({ contractId: 'C123', milestoneIds: [0] });
    expect(res).toEqual({ txXdr: 'xdr456' });
    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body as string)).toMatchObject({ mode: 'freighter' });
  });

  it('releaseMilestone posts to /escrow/release with mode', async () => {
    fetchMock.mockImplementation(async () => jsonResponse({ tx_hash: 'r1' }));
    const client = createOrkaClient({
      baseUrl: 'http://localhost:3000',
      mode: 'orka',
    });
    const res = await client.releaseMilestone({
      contractId: 'C123',
      milestoneId: 2,
    });
    expect(res).toEqual({ txHash: 'r1' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:3000/escrow/release');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toMatchObject({
      mode: 'orka',
      contract_id: 'C123',
      milestone_id: 2,
    });
  });

  it('getContractState GETs /escrow/state?contract_id=...', async () => {
    fetchMock.mockImplementation(async () => jsonResponse({ state: 'ok' }));
    const client = createOrkaClient({
      baseUrl: 'http://localhost:3000/',
      mode: 'orka',
    });
    const res = await client.getContractState({ contractId: 'C999' });
    expect(res).toEqual({ state: 'ok' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:3000/escrow/state?contract_id=C999');
    expect(init.method === undefined || init.method === 'GET').toBe(true);
  });
});
