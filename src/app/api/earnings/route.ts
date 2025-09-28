'use server'

import { NextResponse } from 'next/server';
import { collection, getDocs, doc, updateDoc, Timestamp, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { tiers } from '@/lib/constants';

export async function POST(request: Request) {
  const { cronSecret } = await request.json();

  // IMPORTANT: Replace with a secure secret stored in environment variables
  if (cronSecret !== 'your-super-secret-key') { 
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const now = Timestamp.now();

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const lastUpdate = userData.lastEarningsUpdate?.toDate() || new Date(0);
      const hoursSinceLastUpdate = (now.toMillis() - lastUpdate.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastUpdate >= 24) {
        const currentTier = tiers.find(tier => tier.name.toLowerCase() === userData.membershipTier.toLowerCase());
        
        if (currentTier && currentTier.dailyReturn > 0) {
          const earnings = userData.totalDeposit * currentTier.dailyReturn;
          const userRef = doc(db, "users", userDoc.id);

          await runTransaction(db, async (transaction) => {
            transaction.update(userRef, {
              earningsBalance: (userData.earningsBalance || 0) + earnings,
              lastEarningsUpdate: now
            });
          });
        }
      }
    }

    return NextResponse.json({ message: 'Earnings updated successfully' });
  } catch (error) {
    console.error("Error updating earnings: ", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
