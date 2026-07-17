// NAMTLS Withdrawal API v1.0 - 2026-07-17
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { amount, accountNumber, bankCode, narration } = req.body;

    if (!amount || !accountNumber) {
      return res.status(400).json({ success: false, message: 'Amount and account number are required' });
    }

    const FLUTTERWAVE_SECRET = process.env.FLUTTERWAVE_SECRET_KEY;
    
    if (!FLUTTERWAVE_SECRET) {
      return res.status(500).json({ success: false, message: 'Flutterwave API key not configured on server' });
    }

    // Look up bank code if not provided
    let targetBankCode = bankCode;
    if (!targetBankCode) {
      try {
        const bankRes = await fetch('https://api.flutterwave.com/v3/banks/NG', {
          headers: { 'Authorization': `Bearer ${FLUTTERWAVE_SECRET}` }
        });
        const bankData = await bankRes.json();
        if (bankData.status === 'success') {
          const opay = bankData.data.find(b => 
            b.name.toLowerCase().includes('opay') || 
            b.name.toLowerCase().includes('palmpay')
          );
          targetBankCode = opay ? opay.code : 'OPAY';
        } else {
          targetBankCode = 'OPAY';
        }
      } catch (e) {
        targetBankCode = 'OPAY';
      }
    }

    // Call Flutterwave transfer API from the SERVER (no CORS issues)
    const response = await fetch('https://api.flutterwave.com/v3/transfers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        account_bank: targetBankCode,
        account_number: accountNumber,
        amount: amount,
        narration: narration || 'NAMTLS E-Voting Withdrawal',
        currency: 'NGN',
        reference: `NAMTLS-WD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      })
    });

    const data = await response.json();

    if (data.status === 'success') {
      return res.status(200).json({
        success: true,
        message: `✅ ₦${amount.toLocaleString()} sent to ${accountNumber} successfully!`,
        reference: data.data?.reference || '',
        flutterwaveId: data.data?.id || ''
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Flutterwave error: ${data.message || data.data?.complete_message || 'Transfer failed'}`
      });
    }
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${e.message}`
    });
  }
}