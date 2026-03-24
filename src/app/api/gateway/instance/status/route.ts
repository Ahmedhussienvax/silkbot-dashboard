import { NextRequest } from "next/server";
import { gatewayProxy } from "@/app/api/gateway/proxy";

export async function POST(req: NextRequest) {
  return gatewayProxy(req, {
    gatewayPath: "/instance/status/",
    method: "GET", // Gateway status is a GET but takes name in path
    extractInstance: (body) => body.instanceName,
    dynamicPath: true // path/instanceName
  });
}
