// /api/verify-activation.js
// Vercel Serverless Function to verify Flutterwave activation payments
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Use POST' });
  }

  try {
    const { transaction_id, academicYear } = req.body;

    if (!transaction_id || !academicYear) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const secretKey = process.env.FLW_SECRET_KEY;
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (data.status === 'success' && data.data.status === 'successful') {
      return res.status(200).json({
        success: true,
        message: 'Payment verified',
        data: {
          amount: data.data.amount,
          currency: data.data.currency,
          customer: data.data.customer
        }
      });
    }

    return res.status(400).json({
      success: false,
      message: data.message || 'Verification failed'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}