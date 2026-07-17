// NAMTLS DataCharge v3.0 - No Silent Errors
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

const CHARGE_RATE = 20;
const CHARGE_INTERVAL = 5000;
const ADMIN_ID = 'Admin@Namatls128756BC';
const WITHDRAWAL_PIN = '1966';
const OPAY_ACCOUNT = '9167557038';

const DataChargeContext = createContext();

export function useDataCharge() {
  const ctx = useContext(DataChargeContext);
  if (!ctx) {
    return {
      totalCharged: 0, sessionSeconds: 0, sessionCost: 0,
      withdrawalBalance: 0, isCharging: false, setIsCharging: () => {},
      withdraw: async () => ({ success: false, message: 'Context not available' }),
      checkActivationCost: async () => ({ free: false, cost: 25000, message: 'Context not available', canActivate: false }),
      processActivationPayment: async () => ({ success: false, message: 'Context not available' }),
      loadBalance: async () => {},
      ADMIN_ID: 'Admin@Namatls128756BC',
      WITHDRAWAL_PIN: '1966',
      OPAY_ACCOUNT: '9167557038'
    };
  }
  return ctx;
}

async function sendFlutterwavePayout(amount, accountNumber, narration) {
  try {
    const response = await fetch('/api/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        accountNumber,
        narration: narration || 'NAMTLS E-Voting Withdrawal'
      })
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      return {
        success: false,
        message: `❌ API returned non-JSON response: ${text.substring(0, 300)}. Check api/withdraw.js for errors.`
      };
    }

    const data = await response.json();
    return data;
  } catch (e) {
    return {
      success: false,
      message: `❌ Network error calling withdrawal API: ${e.message}. Make sure api/withdraw.js exists and vercel.json has rewrites configured.`
    };
  }
}

export function DataChargeProvider({ children }) {
  const [totalCharged, setTotalCharged] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [sessionCost, setSessionCost] = useState(0);
  const [withdrawalBalance, setWithdrawalBalance] = useState(0);
  const [isCharging, setIsCharging] = useState(true);
  const intervalRef = useRef(null);
  const secondsRef = useRef(null);

  const loadBalance = async () => {
    try {
      const balanceDoc = await getDoc(doc(db, 'finances', 'withdrawalBalance'));
      if (balanceDoc.exists()) {
        setWithdrawalBalance(balanceDoc.data().balance || 0);
        setTotalCharged(balanceDoc.data().totalCharged || 0);
      }
    } catch (e) {
      console.log('Could not load balance:', e.message);
    }
  };

  const saveCharge = async (amount) => {
    try {
      await setDoc(doc(db, 'finances', 'withdrawalBalance'), {
        balance: increment(amount),
        totalCharged: increment(amount),
        lastCharge: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.log('Could not save charge:', e.message);
    }
  };

  useEffect(() => {
    loadBalance();
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (secondsRef.current) clearInterval(secondsRef.current);

    intervalRef.current = setInterval(() => {
      if (!isCharging) return;
      setTotalCharged(prev => prev + CHARGE_RATE);
      setSessionCost(prev => prev + CHARGE_RATE);
      setWithdrawalBalance(prev => prev + CHARGE_RATE);
      saveCharge(CHARGE_RATE);
    }, CHARGE_INTERVAL);

    secondsRef.current = setInterval(() => {
      setSessionSeconds(prev => prev + 5);
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (secondsRef.current) clearInterval(secondsRef.current);
    };
  }, [isCharging]);

  const withdraw = async (adminId, pin, amount) => {
    if (adminId !== ADMIN_ID) return { success: false, message: 'Invalid Admin ID' };
    if (pin !== WITHDRAWAL_PIN) return { success: false, message: 'Invalid Withdrawal PIN' };
    if (amount <= 0) return { success: false, message: 'Invalid withdrawal amount' };
    if (amount > withdrawalBalance) return { success: false, message: `Insufficient balance. Available: ₦${withdrawalBalance.toLocaleString()}` };

    const transferResult = await sendFlutterwavePayout(
      amount,
      OPAY_ACCOUNT,
      `NAMTLS E-Voting withdrawal to Opay ${OPAY_ACCOUNT}`
    );

    // If Flutterwave clearly failed, return the error WITHOUT deducting
    if (!transferResult.success) {
      return transferResult;
    }

    // If there's a warning (pending/unverified), return it WITHOUT deducting
    if (transferResult.warning || transferResult.unverified) {
      return {
        success: false,
        message: transferResult.message,
        reference: transferResult.reference || ''
      };
    }

    // Only reach here if Flutterwave CONFIRMED successful
    // Now deduct from Firebase
    try {
      await setDoc(doc(db, 'finances', 'withdrawalBalance'), {
        balance: increment(-amount),
        lastWithdrawal: new Date().toISOString(),
        lastWithdrawalAmount: amount,
        lastWithdrawalAccount: OPAY_ACCOUNT,
        lastWithdrawalReference: transferResult.reference || '',
        lastWithdrawalFlutterwaveId: transferResult.flutterwaveId || '',
        lastWithdrawalVerified: transferResult.verified ? true : false
      }, { merge: true });

      setWithdrawalBalance(prev => prev - amount);
      
      return {
        success: true,
        message: `✅ CONFIRMED: ₦${amount.toLocaleString()} sent to Opay ${OPAY_ACCOUNT}! Flutterwave verified the transfer was successful. Ref: ${transferResult.reference || 'N/A'}`
      };
    } catch (e) {
      // Money was sent by Flutterwave but Firebase failed to update
      return {
        success: false,
        message: `⚠️ Money WAS sent to Opay (Ref: ${transferResult.reference}) but failed to update balance in Firebase: ${e.message}. Contact admin to manually adjust balance.`
      };
    }
  };

  const checkActivationCost = async (academicYear) => {
    if (academicYear === '2026/2027') return { free: true, cost: 0, message: 'FREE activation for 2026/2027!', canActivate: true };
    try {
      const balanceDoc = await getDoc(doc(db, 'finances', 'withdrawalBalance'));
      const balance = balanceDoc.exists() ? (balanceDoc.data().balance || 0) : 0;
      if (balance < 25000) return { free: false, cost: 25000, message: `Insufficient balance. Need ₦25,000. Available: ₦${balance.toLocaleString()}`, canActivate: false };
      return { free: false, cost: 25000, message: `Activation deducts ₦25,000. Proceed?`, canActivate: true };
    } catch (e) {
      return { free: false, cost: 25000, message: 'Error checking balance', canActivate: false };
    }
  };

  const processActivationPayment = async (academicYear) => {
    if (academicYear === '2026/2027') return { success: true, message: 'Election activated FREE!' };
    try {
      await setDoc(doc(db, 'finances', 'withdrawalBalance'), {
        balance: increment(-25000),
        lastActivationDeduction: 25000,
        lastActivationYear: academicYear,
        lastActivationDate: new Date().toISOString()
      }, { merge: true });
      setWithdrawalBalance(prev => prev - 25000);
      return { success: true, message: `₦25,000 deducted for ${academicYear}.` };
    } catch (e) {
      return { success: false, message: 'Payment failed: ' + e.message };
    }
  };

  return (
    <DataChargeContext.Provider value={{
      totalCharged, sessionSeconds, sessionCost, withdrawalBalance,
      isCharging, setIsCharging, withdraw, checkActivationCost,
      processActivationPayment, loadBalance,
      ADMIN_ID, WITHDRAWAL_PIN, OPAY_ACCOUNT
    }}>
      {children}
    </DataChargeContext.Provider>
  );
}