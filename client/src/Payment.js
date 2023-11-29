import { useEffect, useState } from "react";

import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { loadStripe } from "@stripe/stripe-js";

function Payment() {
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState("");

  // useEffect(() => {
  //   fetch("http://localhost:8080/stripe/config").then(async (r) => {
  //     const { publishableKey } = await r.json();
  //     // console.log(publishableKey)
  //     setStripePromise(loadStripe(publishableKey));
  //   });
  // }, []);

  useEffect(() => {
    fetch("http://localhost:8080/stripe/card/token", {
      method: "POST",
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json',
        "accept": '*',
      },
    }).then(async (result) => {
      let { client_secret } = await result.json();
      setClientSecret(client_secret);
      setStripePromise(loadStripe("pk_test_51OAlGCSBqoRk66YBFJDYfsxMz284PgeIAl9WgNHMlEIChBZX7DoHVrrGwAEu3nqqql5vQfg7dSGkHosD0WqahxMR00kLy07i6z"));
    });
  }, []);

  return (
    <>
      <h1>React Stripe and the Payment Element</h1>
      {clientSecret && stripePromise && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm />
        </Elements>
      )}
    </>
  );
}

export default Payment;
