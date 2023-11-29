import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!stripe || !elements) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe
    .retrievePaymentIntent(clientSecret)
    .then(({ paymentIntent }) => {
      console.log("paymentIntent", paymentIntent);

      // Make a POST request to the Spring Boot server
      fetch("/process-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // You can pass any necessary data in the body
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          // Add any other relevant payment information
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          switch (data.status) {
            case "succeeded":
              setMessage("Payment succeeded!!");
              break;
            case "processing":
              setMessage("Payment is processing!!");
              break;
            default:
              setMessage("Something went wrong!!");
              break;
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          setMessage("Error occurred during payment processing");
        });
    })
    .catch((error) => {
      console.error("Error retrieving payment intent:", error);
      setMessage("Error occurred while retrieving payment intent");
    });
}, [stripe, elements]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/completion`,
      },
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message);
      } else {
        setMessage("An unexpected error occurred.");
      }
    }

    setIsProcessing(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      <button disabled={isProcessing || !stripe || !elements} id="submit">
        <span id="button-text">
          {isProcessing ? "Processing ... " : "Pay now"}
        </span>
      </button>
      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
}
