import { NextRequest } from "next/server";
import { gatewayProxy } from "@/app/api/gateway/proxy";

export async function POST(req: NextRequest) {
  return gatewayProxy(req, {
    gatewayPath: "/api/gateway/crm/update-lead",
    method: "POST",
    extractInstance: (body) => body.instanceId,
  });
}
