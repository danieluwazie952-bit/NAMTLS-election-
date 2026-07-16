import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

const DataChargeContext = createContext();

const CHARGE_RATE = 20; // 20 Naira per interval
const CHARGE_INTERVAL = 5000; // 5 seconds
const ADMIN_ID = 'Admin@Namatls128756BC';
const WITHDRAWAL_PIN = '1966';
const OPAY_ACCOUNT = '9167557038';

export function useDataCharge() {
  return useContext(DataChargeContext);
}

export function DataChargeProvider({ children }) {
  const [totalCharged, setTotalCharged] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [sessionCost, setSessionCost] = useState(0);
  const [withdrawalBalance, setWithdrawalBalance] = useState(0);
  const [isCharging, setIsCharging] = useState(true);
  const intervalRef = useRef(null);
  const secondsRef = useRef(null);

  // Load withdrawal balance from Firebase
  const loadBalance = async () => {
    try {
      const balanceDoc = await getDoc(doc(db, 'finances', 'withdrawalBalance'));
      if (balanceDoc.exists()) {
        setWithdrawalBalance(balanceDoc.data().balance || 0);
        setTotalCharged(balanceDoc.data().totalCharged || 0);
      }
    } catch (e) {
      console.log('Could not load balance from Firebase:', e.message);
    }
  };

  // Save charge to Firebase
  const saveCharge = async (amount) => {
    try {
      await setDoc(doc(db, 'finances', 'withdrawalBalance'), {
        balance: increment(amount),
        totalCharged: increment(amount),
        lastCharge: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.log('Could not save charge to Firebase:', e.message);
    }
  };

  // Start charging
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

  // Withdraw function
  const withdraw = async (adminId, pin, amount) => {
    if (adminId !== ADMIN_ID) {
      return { success: false, message: 'Invalid Admin ID' };
    }
    if (pin !== WITHDRAWAL_PIN) {
      return { success: false, message: 'Invalid Withdrawal PIN' };
    }
    if (amount <= 0) {
      return { success: false, message: 'Invalid withdrawal amount' };
    }
    if (amount > withdrawalBalance) {
      return { success: false, message: `Insufficient balance. Available: ₦${withdrawalBalance.toLocaleString()}` };
    }

    try {
      await setDoc(doc(db, 'finances', 'withdrawalBalance'), {
        balance: increment(-amount),
        lastWithdrawal: new Date().toISOString(),
        lastWithdrawalAmount: amount,
        lastWithdrawalAccount: OPAY_ACCOUNT
      }, { merge: true });

      setWithdrawalBalance(prev => prev - amount);
      return { 
        success: true, 
        message: `Withdrawal of ₦${amount.toLocaleString()} to Opay account ${OPAY_ACCOUNT} successful!` 
      };
    } catch (e) {
      return { success: false, message: 'Failed to process withdrawal: ' + e.message };
    }
  };

  // Check if activation is free (2026/2027) or costs 25,000
  const checkActivationCost = async (academicYear) => {
    // First activation for 2026/2027 is FREE
    if (academicYear === '2026/2027') {
      return { free: true, cost: 0, message: 'First activation for 2026/2027 is FREE!' };
    }
    
    // Load balance to check
    try {
      const balanceDoc = await getDoc(doc(db, 'finances', 'withdrawalBalance'));
      const balance = balanceDoc.exists() ? (balanceDoc.data().balance || 0) : 0;
      
      if (balance < 25000) {
        return { 
          free: false, 
          cost: 25000, 
          message: `Insufficient balance. Activation costs ₦25,000. Available: ₦${balance.toLocaleString()}`,
          canActivate: false 
        };
      }
      
      return { 
        free: false, 
        cost: 25000, 
        message: `Activation will deduct ₦25,000 from withdrawal balance. Proceed?`,
        canActivate: true 
      };
    } catch (e) {
      return { free: false, cost: 25000, message: 'Error checking balance', canActivate: false };
    }
  };

  // Process activation payment
  const processActivationPayment = async (academicYear) => {
    if (academicYear === '2026/2027') {
      return { success: true, message: 'Election activated for FREE!' };
    }

    try {
      await setDoc(doc(db, 'finances', 'withdrawalBalance'), {
        balance: increment(-25000),
        lastActivationDeduction: 25000,
        lastActivationYear: academicYear,
        lastActivationDate: new Date().toISOString()
      }, { merge: true });

      setWithdrawalBalance(prev => prev - 25000);
      return { success: true, message: `₦25,000 deducted for ${academicYear} activation.` };
    } catch (e) {
      return { success: false, message: 'Payment failed: ' + e.message };
    }
  };

  const value = {
    totalCharged,
    sessionSeconds,
    sessionCost,
    withdrawalBalance,
    isCharging,
    setIsCharging,
    withdraw,
    checkActivationCost,
    processActivationPayment,
    loadBalance,
    ADMIN_ID,
    WITHDRAWAL_PIN,
    OPAY_ACCOUNT
  };

  return (
    <DataChargeContext.Provider value={value}>
      {children}
    </DataChargeContext.Provider>
  );
}