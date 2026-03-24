import { NextRequest } from "next/server";
import { gatewayProxy } from "@/app/api/gateway/proxy";

export async function POST(req: NextRequest) {
  return gatewayProxy(req, {
    gatewayPath: "/instance/qr/",
    method: "GET",
    extractInstance: (body) => body.instanceName,
    dynamicPath: true
  });
}
