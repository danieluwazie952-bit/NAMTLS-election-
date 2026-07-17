export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, adminId, pin } = req.body;

  // 1. SECURITY CHECK
  const ADMIN_ID = 'Admin@Namatls128756BC';
  const WITHDRAWAL_PIN = '1966';
  
  if (adminId !== ADMIN_ID || pin !== WITHDRAWAL_PIN) {
    return res.status(401).json({ error: 'Invalid AdminID or PIN' });
  }

  if (!amount || amount < 1000) {
    return res.status(400).json({ error: 'Minimum withdrawal is ₦1000' });
  }

  try {
    // 2. CALL FLUTTERWAVE TRANSFER API
    const response = await fetch('https://api.flutterwave.com/v3/transfers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        account_bank: "100004", // OPAY Bank Code
        account_number: "9167557038",
        amount: Number(amount),
        narration: "NAMATLS Admin Withdrawal",
        currency: "NGN",
        reference: `NAMATLS-${Date.now()}`
      })
    });

    const data = await response.json();

    if (data.status === 'success') {
      return res.status(200).json({ 
        success: true, 
        message: `₦${amount} sent to Opay 9167557038. Ref: ${data.data.reference}`
      });
    } else {
      return res.status(400).json({ success: false, message: data.message });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}