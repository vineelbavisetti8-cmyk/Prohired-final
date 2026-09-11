// @ts-ignore: Deno module
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// @ts-ignore: Deno global
Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin") || "*";
  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
  };

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // @ts-ignore: Deno global
    const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") || "rzp_live_TM2IM1arxu9g5o";
    // @ts-ignore: Deno global
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") || "vMd9QL93e3Hvbls4nW7H6mvR";
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return new Response(JSON.stringify({ error: "Razorpay keys not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      // @ts-ignore: Deno global
      Deno.env.get("SUPABASE_URL")!,
      // @ts-ignore: Deno global
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ₹19 = 1900 paise (launch offer pricing)
    const amount = 1900;
    const receipt = `pro_${user.id.slice(0, 8)}_${Date.now()}`;

    const basicAuth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    const orderRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Authorization": `Basic ${basicAuth}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount, currency: "INR", receipt,
        notes: { user_id: user.id, plan: "pro_monthly" },
      }),
    });
    const order = await orderRes.json();
    if (!orderRes.ok) {
      console.error("Razorpay order error", order);
      return new Response(JSON.stringify({ error: order?.error?.description || "Order failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log the new order in the payments table (service role bypasses RLS)
    const admin = createClient(
      // @ts-ignore: Deno global
      Deno.env.get("SUPABASE_URL")!,
      // @ts-ignore: Deno global
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { error: logErr } = await admin.from("payments").insert({
      user_id: user.id,
      razorpay_order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: "created",
      plan: "pro_monthly",
    });
    if (logErr) console.error("payments insert error", logErr);

    return new Response(JSON.stringify({
      orderId: order.id, amount: order.amount, currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});