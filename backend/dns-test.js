import dns from "dns";

dns.setServers([
  "8.8.8.8",
  "8.8.4.4"
]);

dns.setDefaultResultOrder("ipv4first");

dns.resolveSrv(
  "_mongodb._tcp.cluster0.nyefwik.mongodb.net",
  (err, addresses) => {
    if (err) {
      console.log("DNS ERROR:", err);
      return;
    }

    console.log(addresses);
  }
);
