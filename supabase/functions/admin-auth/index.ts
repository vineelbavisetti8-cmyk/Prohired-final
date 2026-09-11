import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.1/mod.ts"



// @ts-ignore: Deno global
const SECRET = Deno.env.get("ADMIN_JWT_SECRET") || "PROHIRED_ADMIN_SECRET_2024"
const keyBuffer = new TextEncoder().encode(SECRET)
const key = await crypto.subtle.importKey(
  "raw",
  keyBuffer,
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"]
)

serve(async (req: Request) => {
  const origin = req.headers.get("origin") || "*"
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password } = await req.json()

    // Fixed Admin Credentials
    if (email === "prohired@gmail.com" && password === "Prohired56@") {
      // Generate JWT using djwt
      const token = await create(
        { alg: "HS256", typ: "JWT" },
        { 
          role: "admin", 
          email: "prohired@gmail.com",
          exp: getNumericDate(60 * 120), // 2 hours
        },
        key
      )

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Admin authenticated",
          token: token
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    } else {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid credentials" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
