const {
  SubscriptionManagerClient,
  TokenPriceStream,
  dataStreamFilters,
} = require("@hellomoon/api");

const stream = new TokenPriceStream({
  target: {
    targetType: "WEBSOCKET",
  },
  filters: {
    mint: dataStreamFilters.text.equals(
      "So11111111111111111111111111111111111111112"
    ),

    amount: dataStreamFilters.numeric.lessThanEquals(30),
  },
  name: "Avisa cuando el Wrapped Solana baje de 30 USDC",
});

const API_KEY = "23de3d38-b77c-4cf7-a3ba-2630391af7b5";
const client = new SubscriptionManagerClient(API_KEY);
client
  .createSubscription(stream)
  .then((subsciprion) => {
    console.log("Subscription created", subsciprion);
  })
  .catch(console.error);
