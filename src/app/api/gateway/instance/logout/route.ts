import { NextRequest } from "next/server";
import { gatewayProxy } from "@/app/api/gateway/proxy";

export async function POST(req: NextRequest) {
  return gatewayProxy(req, {
    gatewayPath: "/instance/logout/",
    method: "POST", // Actually logout is usually a POST/DELETE but I'll follow user's pattern
    extractInstance: (body) => body.instanceName,
    dynamicPath: true
  });
}
