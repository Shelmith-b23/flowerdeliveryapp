export async function onRequestGet({ request, env }) {
  // Extract query params from Pesapal (e.g., transaction ID)
  const url = new URL(request.url);
  const pesapal_transaction_tracking_id = url.searchParams.get('pesapal_transaction_tracking_id');

  if (!pesapal_transaction_tracking_id) {
    return new Response('Invalid callback', { status: 400 });
  }

  // Proxy to your backend for verification and processing
  try {
    const backendResponse = await fetch(`${env.BACKEND_URL}/api/payment/pesapal/callback?pesapal_transaction_tracking_id=${pesapal_transaction_tracking_id}`, {
      method: 'GET',  // Or POST if needed
      headers: { 'Authorization': `Bearer ${env.API_KEY}` }  // Secure with env vars
    });

    const result = await backendResponse.json();

    // Redirect user based on status (e.g., to success/failure page)
    if (result.status === 'COMPLETED') {
      return Response.redirect('https://flora-x.pages.dev/payment-success', 302);
    } else {
      return Response.redirect('https://flora-x.pages.dev/payment-failure', 302);
    }
  } catch (error) {
    console.error('Callback proxy error:', error);
    return new Response('Callback processing failed', { status: 500 });
  }
}