import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

export async function GET() {
  try {
    const db = await getDb();
    const pipeline = [
      { $match: { 'adData.adLink': { $exists: true, $ne: null, $ne: '' } } },
      { $group: {
        _id: '$adData.adLink',
        count: { $sum: 1 },
        users: {
          $push: {
            senderUsername: '$senderUsername',
            senderHandle: '$senderHandle',
            recipientUsername: '$recipientUsername',
            _id: '$_id'
          }
        }
      }},
      { $sort: { count: -1 } }
    ];
    const result = await db.collection('messages').aggregate(pipeline).toArray();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 