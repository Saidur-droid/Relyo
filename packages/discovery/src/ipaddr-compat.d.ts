import "ipaddr.js";

declare module "ipaddr.js" {
  interface IPv4 {
    /** Type-only compatibility for a branch guarded by kind() === "ipv6". */
    isIPv4MappedAddress(): boolean;
    /** Type-only compatibility for a branch guarded by kind() === "ipv6". */
    toIPv4Address(): IPv4;
  }
}
