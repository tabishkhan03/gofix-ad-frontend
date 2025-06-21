import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(request) {
  try {
    const { sessionToken } = await request.json();

    if (!sessionToken) {
      return NextResponse.json({ error: 'Session token is required' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('sessions');

    const result = await collection.findOneAndUpdate(
      { name: 'main_session' }, 
      { $set: { token: sessionToken, updatedAt: new Date() } },
      { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({ success: true, session: result });

  } catch (error) {
    console.error("Failed to update session:", error);
    return NextResponse.json({ error: 'Failed to update session. See server logs for details.' }, { status: 500 });
  }
} 