// NAMTLS Withdrawal API v2.0 - OPay Fixed
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { amount, accountNumber, narration } = req.body;

    if (!amount || !accountNumber) {
      return res.status(400).json({ success: false, message: 'Amount and account number are required' });
    }

    const FLUTTERWAVE_SECRET = process.env.FLUTTERWAVE_SECRET_KEY;

    if (!FLUTTERWAVE_SECRET) {
      return res.status(500).json({ success: false, message: 'FLUTTERWAVE_SECRET_KEY not set in Vercel environment variables' });
    }

    // OPay bank code for Flutterwave v3 transfers = 100004
    const OPAY_BANK_CODE = '100004';

    // Generate a unique reference
    const reference = `NAMTLS-WD-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    // Call Flutterwave v3 transfer API
    const response = await fetch('https://api.flutterwave.com/v3/transfers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        account_bank: OPAY_BANK_CODE,
        account_number: accountNumber.toString(),
        amount: Number(amount),
        narration: narration || 'NAMTLS E-Voting Withdrawal',
        currency: 'NGN',
        reference: reference,
        beneficiary_name: 'NAMTLS Election Officer'
      })
    });

    const data = await response.json();

    if (data.status === 'success') {
      return res.status(200).json({
        success: true,
        message: `✅ ₦${Number(amount).toLocaleString()} sent to ${accountNumber} successfully!`,
        reference: data.data?.reference || reference,
        flutterwaveId: data.data?.id || ''
      });
    } else {
      // Return the actual Flutterwave error so you can see it
      return res.status(400).json({
        success: false,
        message: `Flutterwave Error: ${data.message || data.data?.complete_message || 'Unknown error'}`,
        flutterwaveResponse: data
      });
    }
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: `Server Error: ${e.message}`
    });
  }
}