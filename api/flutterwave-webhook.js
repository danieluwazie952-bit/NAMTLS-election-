// /api/flutterwave-webhook.js
import { setDoc, doc, increment } from 'firebase/firestore';
import { db } from '../firebase';

export default async function handler(req, res) {
  // 1. Only allow POST requests from Flutterwave
  if (req.method!== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 2. Verify the request is really from Flutterwave using your Secret Hash
  const flutterwaveSignature = req.headers['verif-hash'];
  const mySecretHash = process.env.Flutterwave_WEBHOOK_SECRET; // Make sure this is set in Vercel

  if (!flutterwaveSignature || flutterwaveSignature!== mySecretHash) {
    console.log('Webhook verification failed');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const payload = req.body;

  try {
    // 3. Only process successful payments
    if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
      const amount = payload.data.amount;
      const tx_ref = payload.data.tx_ref;
      const transaction_id = payload.data.id;

      // Extract academicYear from tx_ref. Format: NAMTLS-ACT-2027/2028-169999999
      const academicYear = tx_ref.split('-')[2];

      console.log(`Payment received for ${academicYear}: ₦${amount}`);

      // 4a. Add the money to withdrawalBalance so you can withdraw to Opay
      await setDoc(doc(db, 'finances', 'withdrawalBalance'), {
        balance: increment(amount),
        totalReceived: increment(amount),
        lastPaymentAt: new Date().toISOString()
      }, { merge: true });

      // 4b. Mark this academicYear as paid/activated
      await setDoc(doc(db, 'finances', 'activations'), {
        [academicYear]: {
          paid: true,
          amount,
          paidAt: new Date().toISOString(),
          tx_ref,
          transaction_id
        }
      }, { merge: true });

      console.log(`${academicYear} activated successfully`);
    }

    // 5. Always return 200 to Flutterwave
    return res.status(200).json({ status: 'success' });

  } catch (error) {
    console.error('Webhook error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}