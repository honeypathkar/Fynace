const Bank = require("../models/Bank");

// GET all banks
exports.getAllBanks = async (req, res) => {
  try {
    const banks = await Bank.find().sort({ name: 1 });
    res.json(banks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Seed initial banks (if needed)
exports.seedBanks = async (req, res) => {
  const initialBanks = [
    { name: "State Bank of India", ids: ["SBIINB", "SBIPSG", "SBISMS"] },
    { name: "Punjab National Bank", ids: ["PNBSMS", "PNBOTP"] },
    { name: "Bank of Baroda", ids: ["BOBSMS", "BOBOTP"] },
    { name: "Canara Bank", ids: ["CANBNK"] },
    { name: "Union Bank of India", ids: ["UNIONB"] },
    { name: "Indian Bank", ids: ["INDBNK"] },
    { name: "Central Bank of India", ids: ["CBISMS"] },
    { name: "Bank of India", ids: ["BOIIND"] },
    { name: "UCO Bank", ids: ["UCOBNK"] },
    { name: "HDFC Bank", ids: ["HDFCBK", "HDFCSM"] },
    { name: "ICICI Bank", ids: ["ICICIB", "ICICIS"] },
    { name: "Axis Bank", ids: ["AXISBK"] },
    { name: "Kotak Mahindra Bank", ids: ["KOTAKB"] },
    { name: "Yes Bank", ids: ["YESBNK"] },
    { name: "IDFC First Bank", ids: ["IDFCFB"] },
    { name: "IndusInd Bank", ids: ["INDUSB"] },
    { name: "Federal Bank", ids: ["FEDBNK"] },
    { name: "RBL Bank", ids: ["RBLBNK"] },
    { name: "Bandhan Bank", ids: ["BANDHN"] },
    { name: "Airtel Payments Bank", ids: ["AIRBNK"] },
    { name: "India Post Payments Bank", ids: ["IPPBPS"] },
    { name: "Paytm Payments Bank", ids: ["PAYTMB"] },
    { name: "Jio Payments Bank", ids: ["JIOBNK"] },
    { name: "AU Small Finance Bank", ids: ["AUBANK"] },
    { name: "Ujjivan Small Finance Bank", ids: ["UJJIVN"] },
    { name: "Equitas Small Finance Bank", ids: ["EQUITB"] },
    { name: "Jana Small Finance Bank", ids: ["JANAFB"] },
  ];

  try {
    for (const bank of initialBanks) {
      await Bank.findOneAndUpdate({ name: bank.name }, bank, {
        upsert: true,
        new: true,
      });
    }
    res.json({ message: "Banks seeded successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
