export default function Dogfooding() {
  return (
    <section className="px-4 py-16 md:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="section-label">Dogfooded from day one</p>
          <h2 className="display mt-2 text-6xl uppercase md:text-7xl">Oreenza becomes the first proving ground.</h2>
        </div>
        <div className="grid gap-4">
          {["Migrate real agency projects into ORKA.", "Log every time the team leaves ORKA for Notion, Gmail, Wise, or spreadsheets.", "Use real transaction volume to harden escrow, verification, and ledger workflows.", "Open the product to agencies, then clients, then marketplaces."].map((item) => (
            <div key={item} className="cut-corner rounded-[14px] border-2 border-night bg-white p-5 text-base font-black">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
