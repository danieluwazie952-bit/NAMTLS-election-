// NAMTLS Withdrawal API v3.0 - No Silent Errors - Real Verification
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
      return res.status(500).json({ success: false, message: '❌ FLUTTERWAVE_SECRET_KEY not set in Vercel environment variables. Go to Vercel > Settings > Environment Variables and add it.' });
    }

    // Validate amount
    if (Number(amount) < 100) {
      return res.status(400).json({ success: false, message: '❌ Minimum withdrawal is ₦100' });
    }

    if (Number(amount) > 1000000) {
      return res.status(400).json({ success: false, message: '❌ Maximum withdrawal is ₦1,000,000' });
    }

    // OPay bank code for Flutterwave v3 transfers = 100004
    const OPAY_BANK_CODE = '100004';

    // Generate a unique reference
    const reference = `NAMTLS-WD-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    console.log(`[NAMTLS] Initiating transfer: ₦${amount} to ${accountNumber} (${OPAY_BANK_CODE})`);

    // STEP 1: Submit the transfer to Flutterwave
    const transferResponse = await fetch('https://api.flutterwave.com/v3/transfers', {
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
        beneficiary_name: 'DANIEL CHIDUBEM UWAZIE'
      })
    });

    const transferData = await transferResponse.json();
    console.log('[NAMTLS] Flutterwave transfer response:', JSON.stringify(transferData, null, 2));

    // STEP 2: Check if Flutterwave actually accepted it
    if (transferData.status !== 'success') {
      let errorMsg = transferData.message || 'Unknown Flutterwave error';
      // Check for specific known errors
      if (transferData.data?.complete_message) {
        errorMsg = transferData.data.complete_message;
      }
      if (transferData.data?.note) {
        errorMsg = transferData.data.note;
      }
      // Check for insufficient balance or transfer limit errors
      if (errorMsg.toLowerCase().includes('insufficient') || errorMsg.toLowerCase().includes('balance')) {
        return res.status(400).json({
          success: false,
          message: `❌ Flutterwave: Insufficient balance in your Flutterwave account. Fund your Flutterwave wallet and try again. Details: ${errorMsg}`,
          flutterwaveFullResponse: transferData
        });
      }
      if (errorMsg.toLowerCase().includes('kyc') || errorMsg.toLowerCase().includes('limit')) {
        return res.status(400).json({
          success: false,
          message: `❌ Flutterwave: Your account has KYC or transfer limit restrictions. Log into dashboard.flutterwave.com and complete KYC Level 2. Details: ${errorMsg}`,
          flutterwaveFullResponse: transferData
        });
      }
      return res.status(400).json({
        success: false,
        message: `❌ Flutterwave rejected the transfer: ${errorMsg}`,
        flutterwaveFullResponse: transferData
      });
    }

    // STEP 3: Flutterwave accepted. Now VERIFY the transfer status by querying it back
    const transferId = transferData.data?.id;
    if (transferId) {
      // Wait 3 seconds for Flutterwave to process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Query the transfer status
      const verifyResponse = await fetch(`https://api.flutterwave.com/v3/transfers/${transferId}`, {
        headers: {
          'Authorization': `Bearer ${FLUTTERWAVE_SECRET}`
        }
      });
      const verifyData = await verifyResponse.json();
      console.log('[NAMTLS] Flutterwave verification response:', JSON.stringify(verifyData, null, 2));

      const transferStatus = verifyData.data?.status || '';
      
      // If Flutterwave says it failed, report the truth
      if (transferStatus === 'failed') {
        const failReason = verifyData.data?.complete_message || verifyData.data?.note || 'No reason provided by Flutterwave';
        return res.status(400).json({
          success: false,
          message: `❌ Flutterwave PROCESSED but REJECTED the transfer. Status: FAILED. Reason: ${failReason}. The money was NOT sent to Opay. Check your Flutterwave dashboard > Transactions > Transfers for details.`,
          flutterwaveFullResponse: verifyData,
          reference: reference
        });
      }

      // If still pending, warn the user
      if (transferStatus === 'pending' || transferStatus === 'processing') {
        return res.status(200).json({
          success: true,
          warning: true,
          message: `⚠️ Transfer SUBMITTED to Flutterwave but is still ${transferStatus}. It may take 5-30 minutes to reach your Opay. Check Flutterwave dashboard > Transactions > Transfers. Reference: ${reference}`,
          reference: reference,
          flutterwaveId: transferId,
          status: transferStatus
        });
      }

      // If successful, confirm it
      if (transferStatus === 'successful') {
        return res.status(200).json({
          success: true,
          verified: true,
          message: `✅ CONFIRMED: ₦${Number(amount).toLocaleString()} sent to Opay ${accountNumber}! Flutterwave confirms status: SUCCESSFUL. Ref: ${reference}`,
          reference: reference,
          flutterwaveId: transferId,
          status: 'successful'
        });
      }
    }

    // STEP 4: If we can't verify, return what we know
    return res.status(200).json({
      success: true,
      unverified: true,
      message: `⚠️ Flutterwave ACCEPTED the transfer (Ref: ${reference}) but we could not confirm the final status. Check your Flutterwave dashboard > Transactions > Transfers to verify. Do NOT assume the money was sent until confirmed there.`,
      reference: reference,
      flutterwaveId: transferId || '',
      flutterwaveResponse: transferData
    });

  } catch (e) {
    console.error('[NAMTLS] Server error:', e.message);
    return res.status(500).json({
      success: false,
      message: `❌ Server Error: ${e.message}. Check Vercel function logs for details.`
    });
  }
}