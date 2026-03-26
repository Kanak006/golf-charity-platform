import {createClient} from '@supabase/supabase-js';
import {NextResponse} from 'next/server';

// Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);


console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);



// 🔹 GET → Fetch all scores
export async function GET() {
  const {data, error} = await supabase.from('scores').select('*').order(
      'created_at', {ascending: false});  // ✅ FIXED

  if (error) {
    console.error('GET ERROR:', error);  // ✅ debug added
    return NextResponse.json({error: error.message}, {status: 500});
  }

  return NextResponse.json(data);
}


// 🔹 POST → Add score (keep only latest 5)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {user_id, score} = body;

    if (!user_id || score === undefined) {
      return NextResponse.json(
          {error: 'Missing user_id or score'}, {status: 400});
    }

    // 1️⃣ Get existing scores (oldest first)
    const {data: scores, error: fetchError} =
        await supabase.from('scores')
            .select('*')
            .eq('user_id', user_id)
            .order('created_at', {ascending: true});  // ✅ FIXED (oldest first)

    if (fetchError) {
      console.error('FETCH ERROR:', fetchError);
      return NextResponse.json({error: fetchError.message}, {status: 500});
    }

    // 2️⃣ If already 5 → delete oldest
    if (scores && scores.length >= 5) {
      const oldest = scores[0];

      await supabase.from('scores').delete().eq('id', oldest.id);
    }

    // 3️⃣ Insert new score
    const {data, error} = await supabase.from('scores')
                              .insert([
                                {
                                  user_id,
                                  score
                                  // ❌ removed "date" field (causing issues)
                                },
                              ])
                              .select();

    if (error) {
      console.error('INSERT ERROR:', error);
      return NextResponse.json({error: error.message}, {status: 500});
    }

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (err: any) {
    console.error('SERVER ERROR:', err);
    return NextResponse.json({error: err.message}, {status: 500});
  }
}